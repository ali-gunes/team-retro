# Changelog

All notable changes to Team Retro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2025-01-27

### Added
- ✨ **PDF Export System**: Professional PDF exports with three options
  - Actions Only: Export only action items
  - Full Summary: All cards with votes and poll results  
  - Poll Results: Detailed poll data with breakdowns
- 🌍 **Turkish Translation**: Complete interface translation to Turkish
- 🎨 **Random Pastel Backgrounds**: Beautiful changing backgrounds in light mode
- 🔧 **Heartbeat Mechanism**: Stable WebSocket connections for long sessions
- 📱 **Responsive Layout**: Full viewport usage with scrollable columns
- 🗑️ **Card Deletion**: Author-only card deletion with three-dots menu
- 📊 **Enhanced Polls**: Better poll results display in exports
- 🎯 **Export Dropdown**: User-friendly export options interface
- 📄 **Turkish Character Support**: Proper encoding for Turkish text in PDFs

### Changed
- 🔄 **Layout Improvements**: Sections now extend to footer without page scrolling
- 🎨 **Theme Default**: Light mode is now the default theme
- 📱 **Column Layout**: Add Card button moved to top of columns
- 🏷️ **Poll Count Display**: Shows "X anket" instead of "X kart" for poll column
- 🎨 **Background System**: Removed hardcoded backgrounds in favor of random pastels
- 📄 **Export Filenames**: Include room name and date in PDF filenames

### Fixed
- 🐛 **Turkish Characters**: Fixed encoding issues in PDF exports
- 🐛 **Poll Results**: Now shows detailed poll breakdowns in summary exports
- 🐛 **Layout Issues**: Fixed responsive layout and scrolling behavior
- 🐛 **Export API**: Fixed missing polls and pollVotes in mock data
- 🐛 **Heartbeat**: Fixed WebSocket connection stability issues

### Technical
- 📦 **Dependencies**: Added jsPDF and html2canvas for PDF generation
- 🔧 **Font Support**: Improved Turkish character support in PDFs
- 🏗️ **Code Organization**: Separated export logic into utility functions
- 🎨 **Component Structure**: Created dedicated ExportDropdown component

## [1.1.0] - 2025-01-26

### Added
- ✨ **Interactive Poll System**: Real-time voting with categorized poll selection
- 📋 **Poll Categories**: Organized polls by category (Team Health, Process, etc.)
- 🎯 **Multiple Poll Types**: Yes/No, Scale 1-5, Multiple Choice, Emoji Scale
- 🔄 **Optimistic Updates**: Instant UI feedback with server reconciliation
- 📊 **Poll Results**: Real-time result display with vote counts
- 🎨 **Poll Selection UI**: Toggle-based selection with category tabs
- 📱 **Responsive Poll Layout**: Centered layout when polls are hidden

### Changed
- 🔄 **Room Creation**: Enhanced with poll selection interface
- 📊 **Column Visibility**: Dynamic column display based on poll selection
- 🎨 **UI Improvements**: Better toggle switch and tab styling
- 📱 **Layout**: Centered columns when polls are disabled

### Fixed
- 🐛 **Tab Clicks**: Fixed form submission on category tab clicks
- 🐛 **Poll Visibility**: Non-facilitator users can now see polls
- 🐛 **Rapid Changes**: Fixed poll option changes not registering
- 🐛 **Layout Issues**: Improved responsive design for poll selection

### Technical
- 📦 **Dependencies**: Updated polls.json with new structure
- 🏗️ **Type Safety**: Added Poll and PollVote interfaces
- 🔧 **WebSocket**: Enhanced message handling for poll votes
- 🎨 **Component Structure**: Created dedicated PollCard component

## [1.0.0] - 2025-01-25

### Added
- 🚀 **Real-time Collaboration**: Live updates across all connected users
- 📝 **Card Management**: Add, vote, and organize cards
- 👥 **Multi-user Support**: Multiple participants can join simultaneously
- 🎨 **Modern UI**: Clean, intuitive interface with dark/light mode
- 📊 **Four-Column Board**: Start, Stop, Action, and Quick Polls columns
- 🗳️ **Voting System**: Upvote cards to prioritize discussion
- 😀 **Emoji Reactions**: React to cards with emojis
- 🎯 **Drag & Drop**: Move cards between columns seamlessly
- 🔗 **Share Functionality**: Copy room links to clipboard
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎨 **Color-coded Columns**: Different colors for different card types
- 🔒 **Card Deletion**: Delete cards (author-only with proper authorization)
- 📊 **Connection Status**: Visual indicator for WebSocket connection health

### Technical
- 🏗️ **Next.js 14**: App router and modern React patterns
- 🔧 **TypeScript**: Full type safety across the application
- 🎨 **TailwindCSS**: Utility-first styling with custom theme
- 🔌 **PartyKit**: Real-time WebSocket communication
- 🗄️ **Redis**: In-memory data storage with Upstash
- 📦 **Dependencies**: React Beautiful DnD, Lucide React icons

### Infrastructure
- 🚀 **Vercel Ready**: Optimized for Vercel deployment
- 🔧 **Environment Variables**: Configurable Redis connection
- 📦 **Package Management**: npm with proper dependency management
- 🧪 **Development Tools**: ESLint, TypeScript, and build optimization

## [0.9.0] - 2025-01-24

### Added
- 🎯 **Initial Setup**: Basic project structure and dependencies
- 📝 **Core Components**: Basic card and board components
- 🔌 **WebSocket Connection**: Initial PartyKit integration
- 🎨 **Basic Styling**: TailwindCSS setup with custom colors
- 📱 **Responsive Layout**: Mobile-first design approach

### Technical
- 🏗️ **Project Structure**: Organized file structure
- 📦 **Dependencies**: Core dependencies installation
- 🔧 **Configuration**: Basic Next.js and PartyKit setup

---

## Version History

- **v1.2.0** (Current): Export system, Turkish translation, pastel backgrounds
- **v1.1.0**: Interactive poll system with real-time voting
- **v1.0.0**: Core real-time collaboration features
- **v0.9.0**: Initial project setup and basic components

## Contributing

When adding new features or making significant changes, please update this changelog following the format above. Include:

- **Added**: New features
- **Changed**: Changes in existing functionality  
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes

## Acknowledgments

- **C&I ekibi için ❤️ ve ☕️ ile yapılmıştır.**
- Built with Next.js, TypeScript, and PartyKit
- Icons by Lucide React
- Styling with TailwindCSS 