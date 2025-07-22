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
│   │   ├── page.tsx           # Landing page
│   │   ├── create/            # Create room page
│   │   ├── join/              # Join room page
│   │   ├── room/[id]/         # Room page
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── retro-board.tsx   # Main board component
│   │   ├── retro-column.tsx  # Column component
│   │   ├── retro-card.tsx    # Card component
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   └── types/                # TypeScript type definitions
├── partykit/                 # PartyKit server
│   ├── room.ts              # WebSocket room handler
│   └── partykit.json        # PartyKit configuration
├── public/                   # Static assets
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
2. Click "Create New Retro"
3. Enter room name and your name
4. You'll be redirected to the room as facilitator

### Joining a Room
1. Visit the homepage
2. Click "Join Existing Retro"
3. Enter the room ID and your name
4. Join the active session

### Using the Board
- **Add Cards**: Click "Add Card" in any column
- **Vote**: Click the heart icon on cards
- **React**: Click the message icon to add emojis
- **Drag & Drop**: Move cards between columns
- **Phase Control**: Use the phase controls (facilitator only)

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