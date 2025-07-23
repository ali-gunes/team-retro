# Team Retro - Real-time Retrospective App

A real-time retrospective application for Scrum teams built with React, TypeScript, TailwindCSS, and PartyKit for WebSocket communication.

## 🚀 Features

### Core Functionality
- **Real-time Collaboration**: Live updates across all connected users
- **Four-Column Board**: Start, Stop, Action, and Quick Polls columns
- **Anonymous Cards**: Post cards anonymously by default
- **Markdown Support**: Rich text formatting in cards
- **Voting System**: Upvote cards to prioritize discussion
- **Emoji Reactions**: React to cards with emojis
- **Drag & Drop**: Move cards between columns
- **Card Deletion**: Delete cards (author-only with proper authorization)

### Interactive Poll System
- **Categorized Polls**: Workplace, Sprint, Team, Productivity, and General Mood categories
- **Multiple Poll Types**: Yes/No, Scale (1-5), Emoji Scale, and Multiple Choice polls
- **Real-time Voting**: Instant feedback with optimistic UI updates
- **Poll Selection**: Toggle-based poll selection during room creation
- **Visual Results**: Real-time poll results visible to all participants
- **Auto-sync**: Server reconciliation with error handling

### Room Management
- **Enhanced Room Creation**: Toggle-based poll selection with categorized tabs
- **Share Room Links**: Copy room links to clipboard with toast notifications
- **Automatic Join**: Direct room joining via shared links
- **Room Name Processing**: Auto-trim and capitalize room names
- **Responsive Layout**: Centered layout when polls are hidden

### Phase Management
- **Ideation**: Add cards to columns
- **Grouping**: Organize similar cards
- **Voting**: Vote on important items
- **Discussion**: Discuss top voted items
- **Timer Support**: Visual countdown for each phase

### Facilitator Controls
- **Phase Control**: Start/stop phases and timers
- **Column Locking**: Prevent further editing on columns
- **Room Settings**: Configure anonymity, voting, reactions
- **Export Options**: PDF, Markdown, and JSON exports
- **Card Highlighting**: Highlight important cards

### Technical Features
- **Dark/Light Theme**: Automatic theme switching
- **Responsive Design**: Works on desktop and mobile
- **Real-time Sync**: WebSocket-based state synchronization
- **Redis Storage**: Temporary room state persistence
- **Vercel Deployment**: Ready for production deployment
- **Updates Section**: Auto-carousel showing latest features and improvements

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Next.js 14** for routing and API routes
- **TailwindCSS** for styling with dark mode
- **React Beautiful DnD** for drag and drop
- **React Markdown** for content rendering
- **Lucide React** for icons

### Backend
- **PartyKit** for WebSocket communication
- **Redis** for in-memory storage
- **Node.js** for API routes and exports

### Development
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting

## 📁 Project Structure

```
team-retro/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page with updates section
│   │   ├── create/            # Create room page with poll selection
│   │   ├── join/              # Join room page
│   │   ├── room/[id]/         # Room page with dynamic columns
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── retro-board.tsx   # Main board component
│   │   ├── retro-column.tsx  # Column component with poll support
│   │   ├── retro-card.tsx    # Card component with delete functionality
│   │   ├── poll-card.tsx     # Interactive poll component
│   │   ├── updates-section.tsx # Updates carousel component
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   └── types/                # TypeScript type definitions
├── partykit/                 # PartyKit server
│   ├── room.ts              # WebSocket room handler with poll support
│   └── partykit.json        # PartyKit configuration
├── public/                   # Static assets
│   └── polls.json           # Poll definitions with categories
└── package.json             # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Redis instance (for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd team-retro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your configuration:
   ```env
   NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999
   REDIS_URL=your-redis-url
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Start PartyKit server**
   ```bash
   npx partykit dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Creating a Room
1. Visit the homepage
2. Click "Create New Room"
3. Enter room name and your name
4. **Optional**: Enable Quick Polls and select polls from categories
5. You'll be redirected to the room as facilitator

### Joining a Room
1. Visit the homepage
2. Click "Join Existing Room"
3. Enter the room ID and your name
4. Join the active session

### Using the Board
- **Add Cards**: Click "Add Card" in any column (except Quick Polls)
- **Vote**: Click the heart icon on cards
- **React**: Click the message icon to add emojis
- **Drag & Drop**: Move cards between columns
- **Delete Cards**: Use the three-dots menu (author-only)
- **Vote on Polls**: Click poll options to vote (real-time updates)
- **Phase Control**: Use the phase controls (facilitator only)

### Poll System
- **Enable Polls**: Toggle "Enable Quick Polls" during room creation
- **Select Polls**: Choose from Workplace, Sprint, Team, Productivity, and General Mood categories
- **Vote**: Click on poll options to vote (can change votes dynamically)
- **View Results**: See real-time results and vote counts
- **Poll Types**: Yes/No, Scale (1-5), Emoji Scale, and Multiple Choice

## 🔧 Configuration

### PartyKit Configuration
The PartyKit server handles real-time communication:

```json
{
  "name": "team-retro-partykit",
  "main": "room.ts",
  "parties": {
    "room": "room.ts"
  },
  "env": {
    "REDIS": {
      "type": "redis"
    }
  }
}
```

### Redis Storage
Room data is stored in Redis with the following keys:
- `room:<id>:cards` - Card data
- `room:<id>:votes` - Vote data
- `room:<id>:users` - User data
- `room:<id>:settings` - Room settings
- `room:<id>:polls` - Poll data
- `room:<id>:pollVotes` - Poll vote data

### Poll Configuration
Polls are defined in `public/polls.json` with categories:
- **Workplace**: Manager support, work-life balance, tools/resources
- **Sprint**: Planning process, goals, completion status
- **Team**: Contributions, communication, psychological safety
- **Productivity**: Focus, blockers
- **General Mood**: Sprint feelings, success rating, pride

## 🚀 Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_PARTYKIT_HOST`
   - `REDIS_URL`
3. Deploy the application

### PartyKit Deployment
1. Deploy PartyKit to your preferred platform
2. Update the `NEXT_PUBLIC_PARTYKIT_HOST` environment variable
3. Configure Redis connection

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- TailwindCSS for consistent styling

## 📈 Recent Updates

### v1.2.0 - Poll System Launch (2025-07-24)
- **Interactive Quick Polls**: Real-time voting with categorized poll selection
- **Multiple Poll Types**: Yes/No, Scale, Emoji Scale, and Multiple Choice
- **Optimistic Updates**: Instant UI feedback with server reconciliation
- **Enhanced Room Creation**: Toggle-based poll selection with categorized tabs

### Recent Improvements (2025-07-23)
- **Card Delete Functionality**: Author-only card deletion with proper authorization
- **Share Room Links**: Copy room links with toast notifications and automatic join
- **Responsive Layout**: Centered layout when polls are hidden
- **Room Name Processing**: Auto-trim and capitalize room names

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Real-time communication with [PartyKit](https://partykit.io/)
- Styling with [TailwindCSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
- Turkish footer message: "C&I ekibi için ❤ ve ☕️ ile yapılmıştır." 