import React from 'react';
import { TestButton } from '../common/TestButton';

interface DialogueNode {
  id: string;
  text: string;
  choices?: Array<{
    id: number;
    text: string;
    nextNodeId?: string;
  }>;
  isEnd?: boolean;
}

interface DialogueViewerProps {
  npc: any;
  dialogueState: any;
  onAdvance: (choice: number) => void;
  loading: boolean;
}

export const DialogueViewer: React.FC<DialogueViewerProps> = ({
  npc,
  dialogueState,
  onAdvance,
  loading,
}) => {
  if (!npc) {
    return (
      <div className="dialogue-viewer">
        <h3>Dialogue Interface</h3>
        <div className="no-dialogue">
          <p>Select an NPC to start a conversation</p>
          <div className="dialogue-help">
            <h4>How to use:</h4>
            <ul>
              <li>Click "Start Dialogue" on any NPC</li>
              <li>Read the dialogue text</li>
              <li>Select response choices</li>
              <li>Navigate through the conversation tree</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const currentNode = dialogueState?.currentNode || dialogueState?.dialogue;
  const conversationHistory = dialogueState?.history || [];

  return (
    <div className="dialogue-viewer">
      <h3>Dialogue with {npc.display_name || npc.name}</h3>
      
      <div className="dialogue-window">
        <div className="npc-portrait">
          <div className="portrait-icon">🧙</div>
          <div className="npc-name">{npc.display_name || npc.name}</div>
        </div>
        
        {!dialogueState && (
          <div className="dialogue-placeholder">
            <p>Click "Start Dialogue" to begin conversation</p>
          </div>
        )}
        
        {dialogueState && (
          <div className="dialogue-content">
            {/* Current dialogue text */}
            <div className="current-dialogue">
              <div className="dialogue-bubble npc-bubble">
                {currentNode?.text || dialogueState?.message || 'Hello, traveler!'}
              </div>
            </div>
            
            {/* Conversation history */}
            {conversationHistory.length > 0 && (
              <div className="conversation-history">
                <h4>Conversation History:</h4>
                <div className="history-list">
                  {conversationHistory.map((entry: any, index: number) => (
                    <div key={index} className="history-entry">
                      <div className="history-npc">{entry.npcText}</div>
                      {entry.playerChoice && (
                        <div className="history-player">You: {entry.playerChoice}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Response choices */}
            {currentNode?.choices && currentNode.choices.length > 0 && (
              <div className="dialogue-choices">
                <h4>Choose your response:</h4>
                {currentNode.choices.map((choice: any) => (
                  <TestButton
                    key={choice.id}
                    onClick={() => onAdvance(choice.id)}
                    loading={loading}
                    variant="secondary"
                    className="choice-button"
                  >
                    {choice.text}
                  </TestButton>
                ))}
              </div>
            )}
            
            {/* Mock choices if none provided */}
            {(!currentNode?.choices || currentNode.choices.length === 0) && !currentNode?.isEnd && (
              <div className="dialogue-choices">
                <h4>Choose your response:</h4>
                <TestButton
                  onClick={() => onAdvance(1)}
                  loading={loading}
                  variant="secondary"
                  className="choice-button"
                >
                  "Tell me more about this place."
                </TestButton>
                <TestButton
                  onClick={() => onAdvance(2)}
                  loading={loading}
                  variant="secondary"
                  className="choice-button"
                >
                  "Do you have any quests for me?"
                </TestButton>
                <TestButton
                  onClick={() => onAdvance(3)}
                  loading={loading}
                  variant="secondary"
                  className="choice-button"
                >
                  "Goodbye."
                </TestButton>
              </div>
            )}
            
            {/* End of conversation */}
            {currentNode?.isEnd && (
              <div className="dialogue-end">
                <p><em>Conversation ended</em></p>
                <TestButton
                  onClick={() => window.location.reload()}
                  variant="primary"
                  size="small"
                >
                  Start New Conversation
                </TestButton>
              </div>
            )}
          </div>
        )}
        
        {/* Dialogue state info */}
        {dialogueState && (
          <div className="dialogue-state">
            <small>
              State: {dialogueState.state || 'active'} | 
              Node: {currentNode?.id || 'root'} | 
              NPC: {npc.type}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};