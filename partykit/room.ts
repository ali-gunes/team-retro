import type * as Party from "partykit/server";
import { v4 as uuidv4 } from 'uuid';
import type { 
  RetroRoom as IRetroRoom, 
  Card, 
  User, 
  Vote, 
  Reaction, 
  PartyMessage,
  CreateCardRequest,
  UpdateCardRequest,
  VoteRequest,
  ReactionRequest,
  PhaseChangeRequest,
  RoomSettingsUpdateRequest
} from '../src/types';

export default class RetroRoomServer implements Party.Server {
  private room: IRetroRoom | null = null;
  private users = new Map<string, User>();

  constructor(readonly party: Party.Party) {}

  async onConnect(ws: Party.Connection, ctx: Party.ConnectionContext) {
    // Get user info from URL parameters or headers
    const url = new URL(ctx.request.url)
    const userId = url.searchParams.get('userId') || ctx.request.headers.get('x-user-id') || uuidv4();
    const userName = url.searchParams.get('userName') || ctx.request.headers.get('x-user-name') || 'Anonymous';
    const isFacilitator = (url.searchParams.get('isFacilitator') === 'true') || (ctx.request.headers.get('x-is-facilitator') === 'true');

    // Check if user already exists in the room
    const existingUser = this.room?.users.find(u => u.id === userId);
    
    const user: User = {
      id: userId,
      name: userName,
      isFacilitator,
      joinedAt: existingUser?.joinedAt || new Date(),
      lastSeen: new Date()
    };

    this.users.set(userId, user);
    ws.setState({ userId, userName, isFacilitator });

    // Load room data from Redis if it exists
    await this.loadRoomData();

    // If room doesn't exist, create it
    if (!this.room) {
      this.room = this.createNewRoom(userId);
      console.log(`Created new room: ${this.party.id} with facilitator: ${userName}`);
    } else if (!existingUser) {
      // Add user to existing room only if they don't already exist
      this.room.users.push(user);
      console.log(`User ${userName} joined room: ${this.party.id}. Total users: ${this.room.users.length}`);
    } else {
      // Update existing user's last seen
      existingUser.lastSeen = new Date();
      console.log(`User ${userName} reconnected to room: ${this.party.id}`);
    }

    // Save room data after any changes
    await this.saveRoomData();

    // Send current room state to the new user
    const roomStateMessage: PartyMessage = {
      type: 'room_state',
      payload: this.room,
      timestamp: new Date()
    };
    console.log(`Sending room_state to new user. Room has ${this.room?.cards.length || 0} cards and ${this.room?.users.length || 0} users`);
    console.log('Room users:', this.room?.users.map(u => ({ id: u.id, name: u.name })));
    ws.send(JSON.stringify(roomStateMessage));

    // Notify other users about the new user (only if they're actually new)
    if (!existingUser) {
      this.broadcastToOthers(ws, {
        type: 'user_joined',
        payload: user,
        timestamp: new Date(),
        userId
      });
    }
  }

  async onMessage(message: string, ws: Party.Connection) {
    const { userId, userName, isFacilitator } = ws.state as any;
    
    try {
      const data = JSON.parse(message) as PartyMessage;
      
      switch (data.type) {
        case 'card_added':
          await this.handleCardAdded(data.payload as CreateCardRequest, userId, userName);
          break;
        case 'card_updated':
          await this.handleCardUpdated(data.payload as UpdateCardRequest, userId, userName);
          break;
        case 'card_deleted':
          await this.handleCardDeleted(data.payload as { id: string }, userId, userName);
          break;
        case 'vote_added':
          await this.handleVoteAdded(data.payload as VoteRequest, userId, userName);
          break;
        case 'vote_removed':
          await this.handleVoteRemoved(data.payload as VoteRequest, userId, userName);
          break;
        case 'reaction_added':
          await this.handleReactionAdded(data.payload as ReactionRequest, userId, userName);
          break;
        case 'reaction_removed':
          await this.handleReactionRemoved(data.payload as ReactionRequest, userId, userName);
          break;
        case 'phase_changed':
          if (isFacilitator) {
            await this.handlePhaseChanged(data.payload as PhaseChangeRequest, userId, userName);
          }
          break;
        case 'room_settings_updated':
          if (isFacilitator) {
            await this.handleRoomSettingsUpdated(data.payload as RoomSettingsUpdateRequest, userId, userName);
          }
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Failed to process message' }
      }));
    }
  }

  async onClose(ws: Party.Connection) {
    const { userId, userName } = ws.state as any;
    
    if (userId) {
      console.log(`User ${userName} (${userId}) disconnected from room ${this.party.id}`);
      this.users.delete(userId);
      
      if (this.room) {
        const userIndex = this.room.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          this.room.users.splice(userIndex, 1);
          console.log(`Removed user ${userName} from room ${this.party.id}. Users remaining: ${this.room.users.length}`);
          await this.saveRoomData();
        }
      }

      this.broadcastToOthers(ws, {
        type: 'user_left',
        payload: { userId, userName },
        timestamp: new Date(),
        userId
      });
    }
  }

  private async handleCardAdded(request: CreateCardRequest, userId: string, userName: string) {
    if (!this.room) return;

    const card: Card = {
      id: uuidv4(),
      content: request.content,
      column: request.column,
      authorId: userId,
      authorName: request.authorName || userName,
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 0,
      reactions: [],
      isHighlighted: false,
      isLocked: false
    };

    this.room.cards.push(card);
    this.room.updatedAt = new Date();
    await this.saveRoomData();

    const broadcastMessage: PartyMessage = {
      type: 'card_added',
      payload: card,
      timestamp: new Date(),
      userId
    };
    
    console.log(`Broadcasting card_added: ${card.id} to ${this.party.connections.size} connections`);
    this.broadcast(broadcastMessage);
  }

  private async handleCardUpdated(request: UpdateCardRequest, userId: string, userName: string) {
    if (!this.room) return;

    const cardIndex = this.room.cards.findIndex(c => c.id === request.id);
    if (cardIndex === -1) return;

    const card = this.room.cards[cardIndex];
    const updatedCard: Card = {
      ...card,
      ...request,
      updatedAt: new Date()
    };

    this.room.cards[cardIndex] = updatedCard;
    this.room.updatedAt = new Date();
    await this.saveRoomData();

    this.broadcast({
      type: 'card_updated',
      payload: updatedCard,
      timestamp: new Date(),
      userId
    });
  }

  private async handleCardDeleted(request: { id: string }, userId: string, userName: string) {
    if (!this.room) return;

    const cardIndex = this.room.cards.findIndex(c => c.id === request.id);
    if (cardIndex === -1) return;

    const deletedCard = this.room.cards[cardIndex];
    this.room.cards.splice(cardIndex, 1);
    this.room.updatedAt = new Date();
    await this.saveRoomData();

    this.broadcast({
      type: 'card_deleted',
      payload: deletedCard,
      timestamp: new Date(),
      userId
    });
  }

  private async handleVoteAdded(request: VoteRequest, userId: string, userName: string) {
    if (!this.room) return;

    const card = this.room.cards.find(c => c.id === request.cardId);
    if (!card) return;

    // Check if user already voted
    const existingVote = this.room.votes.find(v => v.cardId === request.cardId && v.userId === userId);
    if (existingVote) return;

    const vote: Vote = {
      id: uuidv4(),
      cardId: request.cardId,
      userId,
      userName: request.userName || userName,
      createdAt: new Date()
    };

    this.room.votes.push(vote);
    card.votes += 1;
    this.room.updatedAt = new Date();
    await this.saveRoomData();

    this.broadcast({
      type: 'vote_added',
      payload: vote,
      timestamp: new Date(),
      userId
    });
  }

  private async handleVoteRemoved(request: VoteRequest, userId: string, userName: string) {
    if (!this.room) return;

    const voteIndex = this.room.votes.findIndex(v => v.cardId === request.cardId && v.userId === userId);
    if (voteIndex === -1) return;

    const removedVote = this.room.votes[voteIndex];
    this.room.votes.splice(voteIndex, 1);

    const card = this.room.cards.find(c => c.id === request.cardId);
    if (card) {
      card.votes = Math.max(0, card.votes - 1);
    }

    this.room.updatedAt = new Date();
    await this.saveRoomData();

    this.broadcast({
      type: 'vote_removed',
      payload: removedVote,
      timestamp: new Date(),
      userId
    });
  }

  private async handleReactionAdded(request: ReactionRequest, userId: string, userName: string) {
    if (!this.room) return;

    const card = this.room.cards.find(c => c.id === request.cardId);
    if (!card) return;

    // Remove any existing reaction from this user on this card
    const existingReactionIndex = card.reactions.findIndex(r => r.userId === userId);
    if (existingReactionIndex !== -1) {
      card.reactions.splice(existingReactionIndex, 1);
    }

    const reaction: Reaction = {
      id: uuidv4(),
      emoji: request.emoji,
      userId,
      userName: request.userName || userName,
      createdAt: new Date()
    };

    card.reactions.push(reaction);
    this.room.updatedAt = new Date();
    await this.saveRoomData();

    this.broadcast({
      type: 'reaction_added',
      payload: reaction,
      timestamp: new Date(),
      userId
    });
  }

  private async handleReactionRemoved(request: ReactionRequest, userId: string, userName: string) {
    if (!this.room) return;

    const card = this.room.cards.find(c => c.id === request.cardId);
    if (!card) return;

    const reactionIndex = card.reactions.findIndex(r => r.emoji === request.emoji && r.userId === userId);
    if (reactionIndex === -1) return;

    const removedReaction = card.reactions[reactionIndex];
    card.reactions.splice(reactionIndex, 1);
    this.room.updatedAt = new Date();
    await this.saveRoomData();

    this.broadcast({
      type: 'reaction_removed',
      payload: removedReaction,
      timestamp: new Date(),
      userId
    });
  }

  private async handlePhaseChanged(request: PhaseChangeRequest, userId: string, userName: string) {
    if (!this.room) return;

    this.room.phase = request.phase;
    this.room.updatedAt = new Date();

    if (request.startTimer) {
      this.room.phaseTimer = {
        phase: request.phase,
        startTime: new Date(),
        duration: this.room.settings.phaseDuration,
        isActive: true
      };
    } else {
      this.room.phaseTimer = undefined;
    }

    await this.saveRoomData();

    this.broadcast({
      type: 'phase_changed',
      payload: { phase: request.phase, timer: this.room.phaseTimer },
      timestamp: new Date(),
      userId
    });
  }

  private async handleRoomSettingsUpdated(request: RoomSettingsUpdateRequest, userId: string, userName: string) {
    if (!this.room) return;

    this.room.settings = { ...this.room.settings, ...request.settings };
    this.room.updatedAt = new Date();
    await this.saveRoomData();

    this.broadcast({
      type: 'room_settings_updated',
      payload: this.room.settings,
      timestamp: new Date(),
      userId
    });
  }

  private createNewRoom(facilitatorId: string): IRetroRoom {
    // Get the facilitator user from the users map
    const facilitator = this.users.get(facilitatorId);
    
    return {
      id: this.party.id,
      name: `Retro Room ${this.party.id}`,
      phase: 'ideation',
      facilitatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
      cards: [],
      votes: [],
      users: facilitator ? [facilitator] : [],
      settings: {
        allowAnonymousCards: true,
        allowVoting: true,
        allowReactions: true,
        lockedColumns: [],
        phaseDuration: 10
      }
    };
  }

  private async loadRoomData() {
    try {
      // Check if we have Redis environment variables
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.log('Redis not configured, using in-memory storage');
        return;
      }

      const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/room:${this.party.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          // The result is already a parsed object, no need for JSON.parse
          const parsed = data.result;
          // Convert date strings back to Date objects
          this.room = {
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt),
            cards: parsed.cards.map((card: any) => ({
              ...card,
              createdAt: new Date(card.createdAt),
              updatedAt: new Date(card.updatedAt),
              reactions: card.reactions.map((r: any) => ({
                ...r,
                createdAt: new Date(r.createdAt)
              }))
            })),
            votes: parsed.votes.map((vote: any) => ({
              ...vote,
              createdAt: new Date(vote.createdAt)
            })),
            users: parsed.users.map((user: any) => ({
              ...user,
              joinedAt: new Date(user.joinedAt),
              lastSeen: new Date(user.lastSeen)
            })),
            phaseTimer: parsed.phaseTimer ? {
              ...parsed.phaseTimer,
              startTime: new Date(parsed.phaseTimer.startTime)
            } : undefined
          };
          console.log(`Loaded room data for ${this.party.id} from Redis`);
        }
      }
    } catch (error) {
      console.error('Error loading room data:', error);
    }
  }

  private async saveRoomData() {
    if (!this.room) return;

    try {
      // Check if we have Redis environment variables
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.log('Redis not configured, using in-memory storage');
        return;
      }

      // Save to Redis with 6-hour TTL (21600 seconds)
      const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/room:${this.party.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value: this.room, // Send the object directly, let the API handle serialization
          ex: 21600 // 6 hours in seconds (21600 = 6 * 60 * 60)
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Redis save response:', errorText);
        throw new Error(`Redis save failed: ${response.statusText} - ${errorText}`);
      }

      // Verify TTL was set by checking the TTL of the key
      const ttlResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ttl/room:${this.party.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (ttlResponse.ok) {
        const ttlData = await ttlResponse.json();
        console.log(`Room ${this.party.id} TTL: ${ttlData.result} seconds`);
        
        // If TTL is not set (returns -1), try to set it manually
        if (ttlData.result === -1) {
          console.log(`Setting TTL manually for room ${this.party.id}`);
          const expireResponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/expire/room:${this.party.id}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              seconds: 21600
            })
          });
          
          if (expireResponse.ok) {
            console.log(`Manually set TTL for room ${this.party.id}`);
          }
        }
      }

      console.log(`Saved room data for ${this.party.id} with 6-hour TTL`);
    } catch (error) {
      console.error('Error saving room data:', error);
    }
  }

  private broadcast(message: PartyMessage) {
    console.log(`Broadcasting ${message.type} to all connections (${this.party.connections.size})`);
    this.party.broadcast(JSON.stringify(message));
  }

  private broadcastToOthers(ws: Party.Connection, message: PartyMessage) {
    console.log(`Broadcasting ${message.type} to others (excluding ${ws.id})`);
    this.party.broadcast(JSON.stringify(message), [ws.id]);
  }
} 