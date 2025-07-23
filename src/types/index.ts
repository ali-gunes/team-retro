export interface User {
  id: string;
  name: string;
  isFacilitator: boolean;
  joinedAt: Date;
  lastSeen: Date;
}

export interface Poll {
  question: string
  type: 'yes_no' | 'scale_1_5' | 'multiple_choice' | 'emoji_scale'
  options?: string[]
}

export interface PollVote {
  pollId: string
  userId: string
  value: number | string
  createdAt: Date
}

export interface Card {
  id: string;
  content: string;
  column: RetroColumn;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  votes: number;
  reactions: Reaction[];
  isHighlighted: boolean;
  isLocked: boolean;
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

export interface Vote {
  id: string;
  cardId: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

export type RetroColumn = 'start' | 'stop' | 'action' | 'poll';

export type RetroPhase = 'ideation' | 'grouping' | 'voting' | 'discussion';

export interface RetroRoom {
  id: string;
  name: string;
  phase: RetroPhase;
  facilitatorId: string;
  createdAt: Date;
  updatedAt: Date;
  cards: Card[];
  votes: Vote[];
  users: User[];
  polls: Poll[];
  pollVotes: PollVote[];
  settings: RoomSettings;
  phaseTimer?: PhaseTimer;
}

export interface RoomSettings {
  allowAnonymousCards: boolean;
  allowVoting: boolean;
  allowReactions: boolean;
  lockedColumns: RetroColumn[];
  phaseDuration: number; // in minutes
}

export interface PhaseTimer {
  phase: RetroPhase;
  startTime: Date;
  duration: number; // in minutes
  isActive: boolean;
}

export interface ExportFormat {
  type: 'pdf' | 'markdown' | 'json';
  includeVotes: boolean;
  includeReactions: boolean;
  includeTimestamps: boolean;
}

export interface PartyMessage {
  type: PartyMessageType;
  payload: any;
  timestamp: Date;
  userId: string;
}

export interface RedisRoomData {
  room: RetroRoom;
  lastActivity: Date;
}

export interface CreateCardRequest {
  content: string;
  column: RetroColumn;
  authorName?: string;
}

export interface UpdateCardRequest {
  id: string;
  content?: string;
  column?: RetroColumn;
  isHighlighted?: boolean;
}

export interface VoteRequest {
  cardId: string;
  userName?: string;
}

export interface ReactionRequest {
  cardId: string;
  emoji: string;
  userName?: string;
}

export interface PhaseChangeRequest {
  phase: RetroPhase;
  startTimer?: boolean;
}

export interface RoomSettingsUpdateRequest {
  settings: Partial<RoomSettings>;
}

export interface ExportRequest {
  format: ExportFormat;
  roomId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 

export type PartyMessageType = 
  | 'user_joined' 
  | 'room_state' 
  | 'card_added' 
  | 'card_updated' 
  | 'card_deleted' 
  | 'vote_added' 
  | 'vote_removed' 
  | 'reaction_added' 
  | 'reaction_removed' 
  | 'poll_vote_added'
  | 'poll_vote_removed'
  | 'phase_changed' 
  | 'user_left' 
  | 'room_settings_updated' 
  | 'error'; 