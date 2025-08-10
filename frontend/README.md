# Two Player Chess - Frontend

This is the React frontend for the Two Player Chess application, built with Vite for fast development and modern tooling.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Preview production build**
   ```bash
   npm run preview
   ```

## 🛠️ Tech Stack

- **React 19** - Modern React with concurrent features
- **Vite** - Fast build tool with HMR (Hot Module Replacement)
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible headless UI components
- **Socket.io Client** - Real-time communication with backend
- **Chess.js** - Chess game logic and validation
- **react-chessboard** - Interactive chess board component

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── gameOptions/    # Game control components
│   ├── utils/          # Utility components
│   ├── ui/            # Base UI components (Radix)
│   ├── ChessBoard.jsx  # Main chess board
│   ├── Menu.jsx        # Main menu
│   └── Navbar.jsx      # Navigation
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── lib/               # Utility functions
├── App.jsx           # Main app component
└── main.jsx          # Entry point
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` for development:
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_APP_NAME=Two Player Chess
```

### Backend Connection

The frontend connects to the backend via Socket.io. Update the connection URL in `src/App.jsx`:

```javascript
const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
```

## 🎮 Features

- **Real-time Multiplayer** - Play chess with friends online
- **Interactive Board** - Drag and drop pieces with visual feedback
- **Game Controls** - Resign, offer draws, play again
- **Timer Support** - Configurable time controls
- **Responsive Design** - Works on desktop and mobile
- **Modern UI** - Clean design with dark mode support

## 📚 Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🔗 Related Documentation

- [Main Project README](../README.md) - Full project overview
- [Backend Documentation](../docs/BACKEND.md) - Server architecture
- [API Documentation](../docs/API.md) - Socket.io events
- [Frontend Architecture](../docs/FRONTEND.md) - Detailed frontend docs
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute

## 🐛 Troubleshooting

**Connection Issues**
- Ensure backend server is running on correct port
- Check CORS configuration in backend
- Verify environment variables are set correctly

**Build Issues**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version compatibility (requires Node 18+)

For more help, see the [main project documentation](../README.md) or create an issue.
