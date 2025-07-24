# Team Retro - Real-time Retrospectives

A modern, real-time retrospective tool built with Next.js, TypeScript, and PartyKit for seamless team collaboration.

## 🌟 Features

### Real-time Collaboration
- **Live Updates**: See cards, votes, and reactions in real-time
- **WebSocket Connection**: Stable connection with heartbeat mechanism
- **Multi-user Support**: Multiple participants can join simultaneously
- **Connection Status**: Visual indicator for connection health

### Interactive Poll System
- **Predefined Polls**: Choose from curated polls during room creation
- **Multiple Poll Types**: Yes/No, Scale 1-5, Multiple Choice, Emoji Scale
- **Real-time Voting**: Vote and change votes dynamically
- **Poll Categories**: Organized polls by category (Team Health, Process, etc.)
- **Optimistic Updates**: Instant UI feedback with server reconciliation

### Room Management
- **Easy Room Creation**: Simple room creation with custom names
- **Join via Link**: Share room links for instant joining
- **Room Name Formatting**: Automatic trimming and capitalization
- **Participant Tracking**: Real-time participant count

### Card Management
- **Drag & Drop**: Move cards between columns seamlessly
- **Voting System**: Vote on cards with real-time updates
- **Reactions**: Add emoji reactions to cards
- **Card Deletion**: Delete cards (author-only)
- **Anonymous Cards**: Option for anonymous card creation

### Export Functionality
- **PDF Export**: Professional PDF reports with three options:
  - **Actions Only**: Export only action items
  - **Full Summary**: All cards with votes and poll results
  - **Poll Results**: Detailed poll data with breakdowns
- **Turkish Character Support**: Proper encoding for Turkish text
- **Professional Formatting**: Clean, readable PDFs with metadata

### User Experience
- **Turkish Interface**: Fully translated to Turkish
- **Random Pastel Backgrounds**: Beautiful, changing backgrounds in light mode
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between themes
- **Accessibility**: Screen reader friendly with proper ARIA labels

### Visual Design
- **Modern UI**: Clean, intuitive interface
- **Color-coded Columns**: Different colors for different card types
- **Emoji Integration**: Visual indicators throughout the app
- **Smooth Animations**: Polished user interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Redis (for PartyKit)

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
   
   Add your Redis URL to `.env.local`:
   ```
   UPSTASH_REDIS_REST_URL=your_redis_url_here
   UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📖 Usage

### Creating a Room
1. Click "Yeni Oda Oluştur" on the main page
2. Enter a room name
3. Optionally enable "Hızlı Anketleri Etkinleştir"
4. Select polls from different categories if enabled
5. Click "Oda Oluştur"

### Joining a Room
1. Click "Mevcut Odaya Katıl" on the main page
2. Enter the room ID
3. Click "Odaya Katıl"

### Using the Board
- **Add Cards**: Click "Kart Ekle" in any column
- **Vote**: Click the vote button on cards
- **Drag & Drop**: Move cards between columns
- **Delete**: Use the three-dots menu (author only)
- **Share**: Click the share button to copy the join link

### Exporting Data
1. Click "Dışa Aktar" in the room header
2. Choose from three export options:
   - **Aksiyon Maddeleri**: Only action items
   - **Tam Özet**: All cards and poll results
   - **Anket Sonuçları**: Detailed poll data
3. PDF will download automatically

## 🏗️ Project Structure

```
team-retro/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── page.tsx           # Main landing page
│   │   ├── create/page.tsx    # Room creation page
│   │   ├── join/page.tsx      # Room joining page
│   │   └── room/[id]/page.tsx # Room board page
│   ├── components/             # React components
│   │   ├── retro-board.tsx    # Main board component
│   │   ├── retro-column.tsx   # Individual column
│   │   ├── retro-card.tsx     # Card component
│   │   ├── poll-card.tsx      # Poll component
│   │   ├── export-dropdown.tsx # Export options
│   │   ├── room-header.tsx    # Room header
│   │   ├── updates-section.tsx # Updates carousel
│   │   └── ui/                # UI components
│   ├── hooks/                  # Custom hooks
│   │   └── use-party-socket.ts # WebSocket hook
│   ├── types/                  # TypeScript types
│   │   └── index.ts           # Type definitions
│   └── utils/                  # Utility functions
│       └── export-utils.ts    # PDF export utilities
├── partykit/                   # PartyKit server
│   └── room.ts                # Room logic and WebSocket handling
├── public/                     # Static assets
│   ├── polls.json             # Predefined polls
│   ├── logo_teamretro.svg     # Logo
│   └── logo_teamretro.png     # Favicon
└── package.json
```

## 🔧 Configuration

### Poll Configuration
Polls are defined in `public/polls.json` with the following structure:
```json
[
  {
    "category": "Team Health",
    "polls": [
      {
        "question": "How is the team morale?",
        "type": "scale_1_5"
      }
    ]
  }
]
```

### Poll Types
- **yes_no**: Yes/No questions
- **scale_1_5**: 1-5 scale questions
- **multiple_choice**: Multiple choice with options
- **emoji_scale**: Emoji-based rating

## 🗄️ Data Storage

### Redis Storage
- `room:<id>`: Room data (cards, votes, users, polls)
- `room:<id>:polls`: Selected polls for the room
- `room:<id>:pollVotes`: Poll vote data

### Local Storage
- `room-name-<id>`: Room name
- `room-polls-<id>`: Selected polls data
- `user-id`: User identification

## 🔌 API Endpoints

- `GET /api/export`: Export room data (legacy JSON export)
- WebSocket: Real-time communication via PartyKit

## 🎨 Styling

- **TailwindCSS**: Utility-first CSS framework
- **Custom Colors**: Retro-themed color palette
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Full dark mode support

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables
```
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

## 🔄 Recent Updates

### v1.2.0 - Export & Polish (Current)
- ✨ **PDF Export System**: Professional PDF exports with three options
- 🌍 **Turkish Translation**: Complete interface translation
- 🎨 **Random Pastel Backgrounds**: Beautiful changing backgrounds
- 🔧 **Heartbeat Mechanism**: Stable WebSocket connections
- 📱 **Responsive Layout**: Full viewport usage with scrollable columns
- 🗑️ **Card Deletion**: Author-only card deletion
- 📊 **Enhanced Polls**: Better poll results display

### v1.1.0 - Poll System
- ✨ **Interactive Polls**: Real-time voting system
- 📋 **Poll Categories**: Organized poll selection
- 🎯 **Multiple Poll Types**: Yes/No, Scale, Multiple Choice, Emoji
- 🔄 **Optimistic Updates**: Instant UI feedback
- 📊 **Poll Results**: Real-time result display

### v1.0.0 - Core Features
- 🚀 **Real-time Collaboration**: Live updates and WebSocket
- 📝 **Card Management**: Add, vote, and organize cards
- 👥 **Multi-user Support**: Multiple participants
- 🎨 **Modern UI**: Clean, intuitive interface

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **C&I ekibi için ❤️ ve ☕️ ile yapılmıştır.**
- Built with Next.js, TypeScript, and PartyKit
- Icons by Lucide React
- Styling with TailwindCSS 