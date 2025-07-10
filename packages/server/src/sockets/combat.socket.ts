import { Server, Socket } from 'socket.io';
import { CombatService } from '../services/CombatService';
import { CombatAction } from '../types/combat.types';

const combatService = new CombatService();

// Interface for socket data
interface SocketData {
  userId?: string;
  email?: string;
  roles?: string[];
}

// Interface for authenticated socket
interface AuthenticatedSocket extends Socket {
  data: SocketData;
}

// Interface for socket responses
interface SocketResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  timestamp?: number;
  sessionId?: string;
  socketId?: string;
}

export function registerCombatHandlers(io: Server): void {
  io.on('connection', (socket: AuthenticatedSocket) => {
    // Combat socket connected

    // Join combat room
    socket.on('combat:join', async (data: { sessionId: string }, callback?: (response: SocketResponse) => void) => {
      try {
        const { sessionId } = data;
        const userId = socket.data.userId;
        
        if (!userId) {
          const error = { success: false, message: 'Authentication required' };
          socket.emit('combat:error', error);
          if (callback) callback(error);
          return;
        }

        // Validate user is part of this combat
        const isParticipant = await combatService.validateParticipant(sessionId, userId);
        if (!isParticipant) {
          const error = { success: false, message: 'Not a participant in this combat' };
          socket.emit('combat:error', error);
          if (callback) callback(error);
          return;
        }

        socket.join(`combat:${sessionId}`);
        
        const response = { success: true, sessionId };
        socket.emit('combat:joined', response);
        if (callback) callback(response);
        
        // Send current combat state
        const session = await combatService.getSession(sessionId);
        if (session) {
          socket.emit('combat:state', { success: true, data: session });
        }

        // User joined combat room
      } catch (error) {
        const errorResponse = { success: false, message: 'Failed to join combat' };
        socket.emit('combat:error', errorResponse);
        if (callback) callback(errorResponse);
      }
    });

    // Leave combat room
    socket.on('combat:leave', async (data: { sessionId: string }, callback?: (response: SocketResponse) => void) => {
      try {
        const { sessionId } = data;
        socket.leave(`combat:${sessionId}`);
        
        const response = { success: true, message: 'Left combat room' };
        socket.emit('combat:left', response);
        if (callback) callback(response);

        // Socket left combat room
      } catch (error) {
        const errorResponse = { success: false, message: 'Failed to leave combat' };
        if (callback) callback(errorResponse);
      }
    });

    // Handle combat actions
    socket.on('combat:action', async (data: { sessionId: string; action: CombatAction }, callback?: (response: SocketResponse) => void) => {
      try {
        const { sessionId, action } = data;
        const userId = socket.data.userId;

        if (!userId) {
          const error = { success: false, message: 'Authentication required' };
          socket.emit('combat:error', error);
          if (callback) callback(error);
          return;
        }

        // Processing combat action

        // Process action
        const result = await combatService.processAction(sessionId, userId, action);
        
        // Broadcast result to all participants
        io.to(`combat:${sessionId}`).emit('combat:result', {
          success: true,
          data: result,
          timestamp: Date.now()
        });
        
        // Check for combat end
        const session = await combatService.getSession(sessionId);
        if (session && session.status === 'completed') {
          const endData = {
            winner: session.winner,
            endTime: session.endTime,
            duration: session.endTime ? session.endTime - session.startTime : 0,
            rewards: [] // TODO: Implement rewards system
          };
          
          io.to(`combat:${sessionId}`).emit('combat:end', {
            success: true,
            data: endData,
            timestamp: Date.now()
          });

          // Combat ended
        }

        if (callback) callback({ success: true, data: result });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Invalid action';
        const errorResponse = { success: false, message: errorMessage };
        
        socket.emit('combat:error', errorResponse);
        if (callback) callback(errorResponse);

        // Combat action error occurred
      }
    });

    // Resource updates (real-time)
    socket.on('combat:resource:request', async (data: { charId: string }, callback?: (response: SocketResponse) => void) => {
      try {
        const userId = socket.data.userId;
        
        if (!userId) {
          const error = { success: false, message: 'Authentication required' };
          if (callback) callback(error);
          return;
        }

        // Only allow users to request their own resources or visible participants
        const { charId } = data;
        const resources = await combatService.getCharacterResources(charId);
        
        if (resources) {
          const response = {
            success: true,
            data: {
              charId,
              resources,
              timestamp: Date.now()
            }
          };
          
          socket.emit('combat:resource:state', response);
          if (callback) callback(response);
        } else {
          const error = { success: false, message: 'Resources not found' };
          if (callback) callback(error);
        }
      } catch (error) {
        const errorResponse = { success: false, message: 'Failed to get resources' };
        if (callback) callback(errorResponse);
      }
    });

    // Ping for connection testing
    socket.on('combat:ping', (callback?: (response: SocketResponse) => void) => {
      const response = { 
        success: true, 
        message: 'Combat system online',
        timestamp: Date.now(),
        socketId: socket.id
      };
      
      if (callback) {
        callback(response);
      } else {
        socket.emit('combat:pong', response);
      }
    });

    // Handle turn timer events
    socket.on('combat:turn:timer', async (data: { sessionId: string }, callback?: (response: SocketResponse) => void) => {
      try {
        const { sessionId } = data;
        const session = await combatService.getSession(sessionId);
        
        if (session && session.status === 'active') {
          const currentTurnCharId = session.turnOrder[session.currentTurnIndex];
          const turnData = {
            sessionId,
            currentTurn: currentTurnCharId,
            roundNumber: session.roundNumber,
            timeRemaining: 30000, // 30 seconds default
            timestamp: Date.now()
          };
          
          // Broadcast turn timer to all participants
          io.to(`combat:${sessionId}`).emit('combat:turn:update', {
            success: true,
            data: turnData
          });

          if (callback) callback({ success: true, data: turnData });
        }
      } catch (error) {
        const errorResponse = { success: false, message: 'Failed to get turn timer' };
        if (callback) callback(errorResponse);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      // Combat socket disconnected
      // The socket will automatically leave all rooms on disconnect
    });

    // Error handler
    socket.on('error', () => {
      // Combat socket error occurred
      socket.emit('combat:error', {
        success: false,
        message: 'Socket error occurred',
        timestamp: Date.now()
      });
    });
  });

  // Combat socket handlers registered
}

// Helper function to broadcast resource updates to combat participants
export async function broadcastResourceUpdate(
  io: Server, 
  sessionId: string, 
  charId: string, 
  resources: Record<string, unknown>
): Promise<void> {
  io.to(`combat:${sessionId}`).emit('combat:resource:update', {
    success: true,
    data: {
      charId,
      resources,
      timestamp: Date.now()
    }
  });
}

// Helper function to broadcast combat state changes
export async function broadcastCombatState(
  io: Server, 
  sessionId: string, 
  session: Record<string, unknown>
): Promise<void> {
  io.to(`combat:${sessionId}`).emit('combat:state:update', {
    success: true,
    data: session,
    timestamp: Date.now()
  });
}