import type * as Party from "partykit/server";
import { v4 as uuidv4 } from 'uuid';
import { Redis } from '@upstash/redis';
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
  private disconnectingUsers = new Map<string, NodeJS.Timeout>();
  private redis: Redis | null = null;

  constructor(readonly party: Party.Party) {
    // Initialize Redis client if environment variables are available
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    }
  }

  async onConnect(ws: Party.Connection, ctx: Party.ConnectionContext) {
    // Get user info from URL parameters or headers
    const url = new URL(ctx.request.url)
    const userId = url.searchParams.get('userId') || ctx.request.headers.get('x-user-id') || uuidv4();
    const userName = 'Anonymous'; // Always use Anonymous
    const roomName = url.searchParams.get('roomName') || '';
    const selectedPollsParam = url.searchParams.get('selectedPolls');

    console.log(`User attempting to connect: ${userName} (${userId})`)

    // Clear any pending disconnect timeout for this user
    const pendingDisconnect = this.disconnectingUsers.get(userId);
    if (pendingDisconnect) {
      clearTimeout(pendingDisconnect);
      this.disconnectingUsers.delete(userId);
      console.log(`User ${userName} reconnected before being removed`);
    }

    // Load room data from Redis if it exists
    await this.loadRoomData();

    // Check if user already exists in the room
    const existingUser = this.room?.users.find(u => u.id === userId);

    // If room doesn't exist, create it
    let isFacilitator = false;
    if (!this.room) {
      // First user to connect becomes the facilitator
      isFacilitator = true;
      
      // Create the user object first
      const user: User = {
        id: userId,
        name: userName,
        isFacilitator: true, // First user is always facilitator
        joinedAt: new Date(),
        lastSeen: new Date()
      };
      
      // Add to users map before creating room
      this.users.set(userId, user);
      ws.setState({ userId, userName, isFacilitator: true });
      
      // Parse selected polls if provided
      let selectedPolls: any[] = [];
      if (selectedPollsParam) {
        try {
          selectedPolls = JSON.parse(selectedPollsParam);
        } catch (error) {
          console.error('Failed to parse selected polls:', error);
        }
      }
      
      // Now create the room with the facilitator properly set and custom room name
      this.room = this.createNewRoom(userId, roomName, selectedPolls);
      console.log(`Created new room: ${this.party.id} with facilitator: ${userName}`);
      console.log('New room users:', this.room.users.map(u => ({ id: u.id, name: u.name, isFacilitator: u.isFacilitator })));
    } else if (!existingUser) {
      // If there are no users in the room, this user becomes the facilitator
      isFacilitator = (this.room.users.length === 0);
      // Add user to existing room only if they don't already exist
      const user: User = {
        id: userId,
        name: userName,
        isFacilitator,
        joinedAt: new Date(),
        lastSeen: new Date()
      };
      this.room.users.push(user);
      this.users.set(userId, user);
      ws.setState({ userId, userName, isFacilitator });
      console.log(`User ${userName} joined room: ${this.party.id}. Total users: ${this.room.users.length}`);
      console.log('Updated room users:', this.room.users.map(u => ({ id: u.id, name: u.name, isFacilitator: u.isFacilitator })));
      // Broadcast user joined to all other users
      this.broadcastToOthers(ws, {
        type: 'user_joined',
        payload: user,
        timestamp: new Date(),
        userId
      });
    } else {
      // Update existing user's last seen
      existingUser.lastSeen = new Date();
      isFacilitator = existingUser.isFacilitator;
      this.users.set(userId, existingUser);
      ws.setState({ userId, userName, isFacilitator });
      console.log(`User ${userName} reconnected to room: ${this.party.id}`);
      console.log('Reconnected room users:', this.room.users.map(u => ({ id: u.id, name: u.name, isFacilitator: u.isFacilitator })));
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
    if (!existingUser && this.room && this.room.users.length > 1) {
      this.broadcastToOthers(ws, {
        type: 'user_joined',
        payload: this.room.users[this.room.users.length - 1],
        timestamp: new Date(),
        userId
      });
    }
  }

  async onMessage(message: string, ws: Party.Connection) {
    const { userId, userName, isFacilitator } = ws.state as any;
    
    try {
      const data = JSON.parse(message) as PartyMessage
      console.log('Received message:', data.type, data.payload)

      switch (data.type) {
        case 'ping':
          // Respond to heartbeat ping with pong
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date()
          }))
          break
          
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
          // TODO: Phase functionality might be implemented in the future
          // await this.handlePhaseChanged(data.payload as PhaseChangeRequest, userId, userName);
          break;
        case 'room_settings_updated':
          if (isFacilitator) {
            await this.handleRoomSettingsUpdated(data.payload as RoomSettingsUpdateRequest, userId, userName);
          }
          break;
        case 'poll_vote_added':
          await this.handlePollVoteAdded(data.payload as any, userId, userName);
          break;
        case 'poll_vote_removed':
          await this.handlePollVoteRemoved(data.payload as any, userId, userName);
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Failed to process message' },
        timestamp: new Date()
      }));
    }
  }

  async onClose(ws: Party.Connection) {
    const { userId, userName } = ws.state as any;
    
    if (userId) {
      console.log(`User ${userName} (${userId}) disconnected from room ${this.party.id}`);
      this.users.delete(userId);
      
      // Set a grace period before removing the user from the room
      // This prevents race conditions when users refresh the page
      const disconnectTimeout = setTimeout(async () => {
        if (this.room) {
          const userIndex = this.room.users.findIndex(u => u.id === userId);
          if (userIndex !== -1) {
            this.room.users.splice(userIndex, 1);
            console.log(`Removed user ${userName} from room ${this.party.id} after grace period. Users remaining: ${this.room.users.length}`);
            await this.saveRoomData();
            
            this.broadcastToOthers(ws, {
              type: 'user_left',
              payload: { userId, userName },
              timestamp: new Date(),
              userId
            });
          }
        }
        this.disconnectingUsers.delete(userId);
      }, 5000); // 5 second grace period
      
      this.disconnectingUsers.set(userId, disconnectTimeout);
      console.log(`User ${userName} marked for removal in 5 seconds`);
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
    
    console.log(`Broadcasting card_added: ${card.id} to all connections`);
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
      // Preserve reactions when updating card
      reactions: card.reactions,
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

    // Broadcast the updated card instead of just the reaction
    this.broadcast({
      type: 'card_updated',
      payload: card,
      timestamp: new Date(),
      userId
    });
  }

  private async handleReactionRemoved(request: ReactionRequest, userId: string, userName: string) {
    if (!this.room) return;

    const { cardId, emoji } = request;
    const card = this.room.cards.find(c => c.id === cardId);
    
    if (!card) {
      console.error(`Card not found: ${cardId}`);
      return;
    }

    // Remove the reaction
    const reactionIndex = card.reactions.findIndex(r => 
      r.emoji === emoji && r.userId === userId
    );

    if (reactionIndex !== -1) {
      const removedReaction = card.reactions[reactionIndex];
      card.reactions.splice(reactionIndex, 1);
      card.updatedAt = new Date();
      this.room.updatedAt = new Date();
      await this.saveRoomData();

      const broadcastMessage: PartyMessage = {
        type: 'reaction_removed',
        payload: {
          cardId,
          emoji,
          userId,
          userName
        },
        timestamp: new Date(),
        userId
      };
      
      console.log(`Broadcasting reaction_removed: ${emoji} from card ${cardId}`);
      this.broadcast(broadcastMessage);
    }
  }

  private async handlePollVoteAdded(request: any, userId: string, userName: string) {
    if (!this.room) return;

    const { pollId, value } = request;
    
    // Remove any existing vote from this user for this poll
    this.room.pollVotes = this.room.pollVotes.filter(v => 
      !(v.pollId === pollId && v.userId === userId)
    );

    // Add new vote
    const pollVote = {
      pollId,
      userId,
      value,
      createdAt: new Date()
    };

    this.room.pollVotes.push(pollVote);
    this.room.updatedAt = new Date();
    await this.saveRoomData();

    const broadcastMessage: PartyMessage = {
      type: 'poll_vote_added',
      payload: pollVote,
      timestamp: new Date(),
      userId
    };
    
    console.log(`Broadcasting poll_vote_added: ${pollId} by ${userName}`);
    this.broadcast(broadcastMessage);
  }

  private async handlePollVoteRemoved(request: any, userId: string, userName: string) {
    if (!this.room) return;

    const { pollId } = request;
    
    // Remove vote from this user for this poll
    const removedVote = this.room.pollVotes.find(v => 
      v.pollId === pollId && v.userId === userId
    );

    if (removedVote) {
      this.room.pollVotes = this.room.pollVotes.filter(v => 
        !(v.pollId === pollId && v.userId === userId)
      );
      this.room.updatedAt = new Date();
      await this.saveRoomData();

      const broadcastMessage: PartyMessage = {
        type: 'poll_vote_removed',
        payload: {
          pollId,
          userId,
          userName
        },
        timestamp: new Date(),
        userId
      };
      
      console.log(`Broadcasting poll_vote_removed: ${pollId} by ${userName}`);
      this.broadcast(broadcastMessage);
    }
  }

  // TODO: Phase functionality might be implemented in the future
  // private async handlePhaseChanged(request: PhaseChangeRequest, userId: string, userName: string) {
  //   if (!this.room) return;

  //   this.room.phase = request.phase;
  //   this.room.updatedAt = new Date();

  //   if (request.startTimer) {
  //     this.room.phaseTimer = {
  //       phase: request.phase,
  //       startTime: new Date(),
  //       duration: this.room.settings.phaseDuration,
  //       isActive: true
  //     };
  //   } else {
  //     this.room.phaseTimer = undefined;
  //   }

  //   await this.saveRoomData();

  //   this.broadcast({
  //     type: 'phase_changed',
  //     payload: { phase: request.phase, timer: this.room.phaseTimer },
  //     timestamp: new Date(),
  //     userId
  //   });
  // }

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

  private createNewRoom(facilitatorId: string, roomName: string, selectedPolls: any[]): IRetroRoom {
    // Get the facilitator user from the users map
    const facilitator = this.users.get(facilitatorId);
    
    if (!facilitator) {
      console.error('Facilitator not found in users map:', facilitatorId);
      // Create a default facilitator user if not found
      const defaultFacilitator: User = {
        id: facilitatorId,
        name: 'Anonymous',
        isFacilitator: true,
        joinedAt: new Date(),
        lastSeen: new Date()
      };
      return {
        id: this.party.id,
        name: roomName,
        phase: 'ideation',
        facilitatorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        cards: [],
        votes: [],
        users: [defaultFacilitator],
        settings: {
          allowAnonymousCards: true,
          allowVoting: true,
          allowReactions: true,
          lockedColumns: [],
          phaseDuration: 10
        },
        polls: [], // Initialize polls array
        pollVotes: [] // Initialize pollVotes array
      };
    }
    
    return {
      id: this.party.id,
      name: roomName,
      phase: 'ideation',
      facilitatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
      cards: [],
      votes: [],
      users: [facilitator],
      settings: {
        allowAnonymousCards: true,
        allowVoting: true,
        allowReactions: true,
        lockedColumns: [],
        phaseDuration: 10
      },
      polls: selectedPolls, // Pass selected polls to the new room
      pollVotes: [] // Initialize pollVotes array
    };
  }

  private async loadRoomData() {
    if (!this.redis) {
      console.log('Redis not configured, using in-memory storage');
      return;
    }

    try {
      const data = await this.redis.get(`room:${this.party.id}`);
      if (data) {
        // Parse the JSON string back to an object
        const parsed = JSON.parse(data as string) as IRetroRoom;
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
    } catch (error) {
      console.error('Error loading room data:', error);
    }
  }

  private async saveRoomData() {
    if (!this.redis) {
      console.log('Redis not configured, using in-memory storage');
      return;
    }

    if (!this.room) return;

    try {
      // Save to Redis with 6-hour TTL (21600 seconds)
      await this.redis.set(`room:${this.party.id}`, JSON.stringify(this.room), { ex: 21600 });
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