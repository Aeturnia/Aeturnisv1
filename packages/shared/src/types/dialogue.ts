export interface DialogueSession {
  id: string
  npcId: string
  characterId: string
  currentNodeId: string
  history: string[]
  flags: Record<string, boolean>
  startedAt: Date
}

export interface DialogueOption {
  id: string
  text: string
  targetNodeId: string
  requirements?: DialogueRequirement[]
}

export interface DialogueRequirement {
  type: 'level' | 'quest' | 'item' | 'reputation'
  value: string | number
}

export interface DialogueContext {
  characterLevel: number
  completedQuests: string[]
  reputation: Record<string, number>
  inventory: string[]
}

export interface DialogueAdvanceRequest {
  sessionId: string
  optionId: string
}