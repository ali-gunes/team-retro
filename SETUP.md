# 🚀 Team Retro Setup Guide

## ✅ Installation Complete!

Your real-time retrospective app is now ready to run! Both servers are successfully running:

- ✅ **Next.js App**: http://localhost:3000
- ✅ **PartyKit Server**: http://localhost:1999

Here's what we've accomplished:

### 📦 **Dependencies Installed**
- ✅ React 18 + TypeScript
- ✅ Next.js 14 with App Router
- ✅ TailwindCSS with dark mode
- ✅ PartyKit for real-time communication
- ✅ All UI components and utilities

### 🔧 **Fixed Issues**
- ✅ PartyKit version compatibility (updated to v0.0.115)
- ✅ CSS class conflicts resolved (removed undefined `border-border` class)
- ✅ TypeScript configuration updated (target: es2017)
- ✅ Drag & drop library updated (replaced with `@hello-pangea/dnd`)
- ✅ PartyKit configuration fixed (corrected file paths)
- ✅ Next.js config updated (removed deprecated `appDir`)
- ✅ Button component fixed (removed React.Fragment warning)

## 🎯 **Next Steps**

### 1. **Development Servers Status**

Both servers are now running successfully:

**Next.js App**: http://localhost:3000 ✅
- Handles: Frontend, routing, API routes

**PartyKit Server**: http://localhost:1999 ✅
- Handles: Real-time WebSocket communication

To restart the servers:
```bash
# Terminal 1 - Next.js App
npm run dev

# Terminal 2 - PartyKit Server  
npx partykit dev
```

### 2. **Access the Application**

1. Open your browser to **http://localhost:3000**
2. You'll see the landing page with:
   - "Create New Retro" button
   - "Join Existing Retro" button
   - Dark/light theme toggle

### 3. **Test the Features**

**Create a Room:**
1. Click "Create New Retro"
2. Enter room name and your name
3. You'll be redirected to a room as facilitator

**Join a Room:**
1. Click "Join Existing Retro"
2. Enter the room ID from another user
3. Enter your name to join

**Real-time Features:**
- ✅ Add cards to columns
- ✅ Vote on cards (heart icon)
- ✅ Add emoji reactions
- ✅ Drag & drop cards between columns
- ✅ Phase management (facilitator only)
- ✅ Dark/light theme switching

## 🛠️ **Development Commands**

```bash
# Start development servers
npm run dev          # Next.js app
npx partykit dev     # PartyKit server

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔧 **Environment Variables**

Create a `.env.local` file (optional for development):
```env
NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999
REDIS_URL=your-redis-url
```

## 🎨 **Customization**

### Colors
The app uses custom retro colors defined in `tailwind.config.js`:
- `retro-start`: Green (#10b981)
- `retro-stop`: Red (#ef4444) 
- `retro-action`: Amber (#f59e0b)
- `retro-poll`: Purple (#8b5cf6)

### Components
All components are in `src/components/`:
- `RetroBoard` - Main board layout
- `RetroColumn` - Individual columns
- `RetroCard` - Card component
- `RoomHeader` - Room controls
- `PhaseControls` - Phase management

## 🚀 **Production Deployment**

### Vercel Deployment
1. Connect your repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_PARTYKIT_HOST`
   - `REDIS_URL`
3. Deploy!

### PartyKit Deployment
1. Deploy PartyKit to your preferred platform
2. Update the `NEXT_PUBLIC_PARTYKIT_HOST` environment variable
3. Configure Redis connection

## 🎉 **You're Ready!**

Your real-time retrospective app is now fully functional with:
- ✅ Real-time collaboration
- ✅ Four-column board
- ✅ Voting and reactions
- ✅ Phase management
- ✅ Dark/light themes
- ✅ Responsive design
- ✅ Export functionality

**Happy retrospecting!** 🚀 