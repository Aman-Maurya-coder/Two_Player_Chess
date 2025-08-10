# Frontend Architecture

This document describes the frontend architecture, component structure, and development patterns used in the Two Player Chess React application.

## Overview

The frontend is built with React 19 and Vite, using modern React patterns including hooks, context, and functional components. The application follows a component-based architecture with clear separation of concerns.

## Tech Stack

- **React 19** - UI framework with concurrent features
- **Vite** - Fast build tool and development server
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible headless UI components
- **Chess.js** - Chess game logic and validation
- **react-chessboard** - Interactive chess board component

## Project Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── gameOptions/    # Game control components
│   ├── utils/          # Utility components
│   ├── ui/            # Base UI components (Radix)
│   ├── ChessBoard.jsx  # Main chess board component
│   ├── Menu.jsx        # Main menu component
│   └── Navbar.jsx      # Navigation component
├── context/            # React context providers
│   ├── GameContext.jsx     # Game state management
│   ├── GameOptionsContext.jsx # Game options state
│   ├── PlayerContext.jsx   # Player data management
│   ├── TimerContext.jsx    # Timer state management
│   └── index.jsx           # Context exports
├── hooks/              # Custom React hooks
│   ├── useSocketEmit.js    # Socket emission utility
│   └── useSocketEvent.js   # Socket event handling
├── lib/               # Utility functions
│   └── utils.js       # General utilities
├── App.jsx           # Main application component
└── main.jsx          # Application entry point
```

## Context Architecture

The application uses React Context for state management, divided into logical domains:

### PlayerContext
Manages player-related state and operations.

```javascript
const PlayerContext = createContext();

// State
{
  playerId: string,
  playerName: string,
  playerData: object,
  isInGame: boolean
}

// Actions
{
  setPlayerId: (id) => void,
  updatePlayerData: (data) => void,
  resetPlayerData: () => void
}
```

### GameContext  
Manages game state and chess-related data.

```javascript
const GameContext = createContext();

// State
{
  game: Chess, // Chess.js instance
  gameState: string, // "waiting", "active", "finished"
  currentTurn: string, // "white" | "black"
  boardOrientation: string,
  moveHistory: array,
  gameResult: object
}

// Actions
{
  setGame: (chess) => void,
  updateGameState: (state) => void,
  resetGameState: () => void,
  makeMove: (move) => boolean
}
```

### GameOptionsContext
Manages game options and UI state.

```javascript
const GameOptionsContext = createContext();

// State
{
  isDrawOffered: boolean,
  isPlayAgainRequested: boolean,
  showResignConfirm: boolean,
  timeControl: number,
  increment: number
}

// Actions
{
  updateGameOptions: (options) => void,
  resetGameOptions: () => void
}
```

### TimerContext
Manages timer state for both players.

```javascript
const TimerContext = createContext();

// State
{
  whiteTime: number, // milliseconds
  blackTime: number, // milliseconds
  isTimerActive: boolean,
  currentTimer: string // "white" | "black"
}

// Actions
{
  updateTimer: (color, time) => void,
  startTimer: (color) => void,
  stopTimer: () => void,
  resetTimer: () => void
}
```

## Component Architecture

### App.jsx
The main application component that:
- Establishes Socket.io connection
- Manages global application state
- Handles socket event listeners
- Renders main UI components

```javascript
export const App = memo(function App() {
  // Socket connection and state management
  const socket = useMemo(() => io(url, config), []);
  
  // Context hooks
  const { playerId, playerData } = usePlayerContext();
  const { gameState } = useGameContext();
  
  // Event handlers and effects
  useSocketEvent(socket, "player-joined", handlePlayerJoined);
  useSocketEvent(socket, "game-created", handleGameCreated);
  
  return (
    <div className="app">
      <Navbar />
      {gameState === "active" ? <Board /> : <Menu />}
      <InGameOptions />
      <AlertDialogBox />
    </div>
  );
});
```

### Board Component (ChessBoard.jsx)
Renders the interactive chess board using react-chessboard.

```javascript
export const Board = memo(function Board() {
  const { game, currentTurn, boardOrientation } = useGameContext();
  const { playerId } = usePlayerContext();
  
  const onPieceDrop = useCallback((sourceSquare, targetSquare) => {
    // Validate and make move
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // Always promote to queen for simplicity
    });
    
    if (move) {
      // Emit move to server
      socket.emit("make-move", move);
      return true;
    }
    return false;
  }, [game, socket]);
  
  return (
    <Chessboard 
      position={game.fen()}
      onPieceDrop={onPieceDrop}
      boardOrientation={boardOrientation}
      arePiecesDraggable={canMove}
    />
  );
});
```

### Menu Component
Handles the main menu interface for creating and joining games.

```javascript
export const Menu = memo(function Menu() {
  const { playerData } = usePlayerContext();
  const [menuView, setMenuView] = useState("default");
  
  const renderMenuContent = () => {
    switch (menuView) {
      case "newGameOptions":
        return <NewGameOptions onBack={() => setMenuView("default")} />;
      case "joinGame":
        return <JoinGame onBack={() => setMenuView("default")} />;
      default:
        return <DefaultMenu onNavigate={setMenuView} />;
    }
  };
  
  return (
    <div className="menu-container">
      {renderMenuContent()}
    </div>
  );
});
```

## Custom Hooks

### useSocketEvent
A custom hook for handling Socket.io events with cleanup.

```javascript
export const useSocketEvent = (socket, event, handler) => {
  useEffect(() => {
    if (!socket || !handler) return;
    
    socket.on(event, handler);
    
    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, handler]);
};
```

### useSocketEmit
A custom hook for emitting Socket.io events.

```javascript
export const useSocketEmit = (socket) => {
  const emit = useCallback((event, data) => {
    if (socket && socket.connected) {
      socket.emit(event, data);
    }
  }, [socket]);
  
  return emit;
};
```

## UI Components

### Base Components (ui/)
Reusable components built with Radix UI primitives:

- **Button** - Styled button with variants
- **Dialog** - Modal dialog component
- **AlertDialog** - Confirmation dialog
- **Label** - Form label component
- **Input** - Text input component

Example Button component:
```javascript
const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
```

### Game Components (gameOptions/)
Components for in-game actions:

- **InGameOptions** - Main game controls container
- **DrawOffer** - Draw offer/accept/reject UI
- **PlayAgain** - Play again request/response UI
- **ResignButton** - Game resignation component

### Utility Components (utils/)
Helper components for common functionality:

- **AlertDialogBox** - Global alert dialog
- **TimerManager** - Timer display and management
- **LoadingSpinner** - Loading state indicator

## State Management Patterns

### Context Provider Setup
```javascript
// main.jsx
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <PlayerProvider>
      <GameProvider>
        <GameOptionsProvider>
          <TimerProvider>
            <App />
          </TimerProvider>
        </GameOptionsProvider>
      </GameProvider>
    </PlayerProvider>
  </React.StrictMode>
);
```

### Context Usage Pattern
```javascript
// Component using multiple contexts
const GameComponent = () => {
  const { playerId, playerData } = usePlayerContext();
  const { game, gameState, updateGameState } = useGameContext();
  const { whiteTime, blackTime } = useTimerContext();
  
  // Component logic
};
```

## Event Handling Patterns

### Socket Event Pattern
```javascript
const App = () => {
  const handleGameCreated = useCallback((data) => {
    updateGameState(data);
    setMenuView("waiting");
  }, [updateGameState]);
  
  useSocketEvent(socket, "game-created", handleGameCreated);
};
```

### User Action Pattern
```javascript
const CreateGameButton = () => {
  const emit = useSocketEmit(socket);
  const { gameOptions } = useGameOptionsContext();
  
  const handleCreateGame = useCallback(() => {
    emit("create-game", { gameOptions });
  }, [emit, gameOptions]);
  
  return <Button onClick={handleCreateGame}>Create Game</Button>;
};
```

## Performance Optimizations

### Memoization
- Components wrapped with `React.memo()` to prevent unnecessary re-renders
- `useCallback()` for event handlers to maintain referential equality
- `useMemo()` for expensive calculations and object creation

### Socket Connection Management
```javascript
const socket = useMemo(() => {
  return io(url, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
}, []); // Empty dependency array ensures single instance
```

### Context Optimization
- Separate contexts for different domains to prevent unnecessary updates
- Context values memoized to prevent provider re-renders

## Styling Approach

### Tailwind CSS
- Utility-first approach for rapid development
- Custom configuration in `tailwind.config.js`
- Component variants using `class-variance-authority`

### Design System
- Consistent color palette and spacing
- Responsive design with mobile-first approach
- Dark mode support (configurable)

## Error Handling

### Socket Error Handling
```javascript
useSocketEvent(socket, "error", (error) => {
  setAlertDialogContent({
    title: "Connection Error",
    desc: error.message,
    action: "Retry",
    onAction: () => socket.connect()
  });
  setIsAlertDialogOpen(true);
});
```

### Component Error Boundaries
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Development Guidelines

### Component Development
1. Use functional components with hooks
2. Implement proper PropTypes or TypeScript
3. Handle loading and error states
4. Write accessible components (ARIA labels, keyboard navigation)
5. Test components in isolation

### State Management
1. Keep context focused on specific domains
2. Use reducers for complex state logic
3. Minimize context value changes
4. Provide clear action interfaces

### Performance
1. Profile components with React DevTools
2. Implement code splitting for large features
3. Optimize bundle size with tree shaking
4. Use React Suspense for async components

### Testing Strategy
1. Unit tests for utility functions
2. Component tests with React Testing Library
3. Integration tests for Socket.io interactions
4. E2E tests for critical user flows

This architecture provides a scalable, maintainable foundation for the chess application while following React best practices and modern development patterns.