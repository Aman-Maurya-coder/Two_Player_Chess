# Contributing to Two Player Chess

Thank you for your interest in contributing to Two Player Chess! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

### Types of Contributions

We welcome all types of contributions:

- **Bug Reports** - Help us identify and fix issues
- **Feature Requests** - Suggest new features or improvements
- **Code Contributions** - Submit bug fixes or new features
- **Documentation** - Improve or add documentation
- **Testing** - Help test the application and write tests
- **Design** - Improve UI/UX design and accessibility

### Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Two_Player_Chess.git
   cd Two_Player_Chess
   ```

2. **Set Up Development Environment**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies  
   cd ../frontend
   npm install
   ```

3. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

4. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

## 🐛 Reporting Bugs

### Before Reporting a Bug

1. **Search existing issues** to avoid duplicates
2. **Test with latest version** to ensure the bug still exists
3. **Check documentation** to verify expected behavior

### Bug Report Template

When reporting a bug, please include:

```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g., Windows 10, macOS 12.0, Ubuntu 20.04]
- Browser: [e.g., Chrome 95, Firefox 93, Safari 14]
- Node.js Version: [e.g., 18.17.0]

**Additional Context**
Any other context about the problem.
```

## 💡 Feature Requests

### Before Requesting a Feature

1. **Search existing issues** for similar requests
2. **Check roadmap** for planned features
3. **Consider if the feature fits** the project scope

### Feature Request Template

```markdown
**Feature Description**
A clear description of what you want to happen.

**Problem Statement**
What problem does this feature solve?

**Proposed Solution**
Describe your proposed solution.

**Alternatives Considered**
Other solutions you've considered.

**Additional Context**
Screenshots, mockups, or examples.
```

## 🔧 Code Contributions

### Development Workflow

1. **Create an Issue** (for significant changes)
2. **Fork and Clone** the repository
3. **Create a Branch** from `main`
4. **Make Changes** following our guidelines
5. **Test Thoroughly** 
6. **Submit Pull Request**

### Code Guidelines

#### General Principles

- **Keep it Simple** - Prefer simple, readable solutions
- **Follow Existing Patterns** - Match the current codebase style
- **Write Tests** - Add tests for new functionality
- **Document Changes** - Update relevant documentation

#### JavaScript/React Standards

**Formatting**
- Use 2 spaces for indentation
- Use semicolons consistently
- Use single quotes for strings
- Max line length of 100 characters

**React Components**
```javascript
// ✅ Good - Functional component with proper naming
export const ChessBoard = memo(function ChessBoard({ gameState, onMove }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  
  const handleSquareClick = useCallback((square) => {
    // Handle logic
  }, [onMove]);
  
  return (
    <div className="chess-board">
      {/* Component JSX */}
    </div>
  );
});

// ❌ Bad - Inconsistent naming and structure
export default function chessboard(props) {
  // Component logic
}
```

**Hooks Usage**
```javascript
// ✅ Good - Proper dependency arrays and memoization
const handlePlayerMove = useCallback((move) => {
  if (!gameState.isPlayerTurn) return;
  onMove(move);
}, [gameState.isPlayerTurn, onMove]);

useEffect(() => {
  if (gameState.isGameOver) {
    showGameOverDialog();
  }
}, [gameState.isGameOver]);

// ❌ Bad - Missing dependencies
const handlePlayerMove = useCallback((move) => {
  if (!gameState.isPlayerTurn) return;
  onMove(move);
}, []); // Missing dependencies
```

**Context Usage**
```javascript
// ✅ Good - Focused context with clear actions
const GameContext = createContext();

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return context;
};

// ❌ Bad - Too many unrelated values in one context
const AppContext = createContext(); // Contains everything
```

#### Node.js/Backend Standards

**Error Handling**
```javascript
// ✅ Good - Proper error handling
socket.on("make-move", async (data) => {
  try {
    const validation = validateMoveInput(data);
    if (!validation.valid) {
      return socket.emit("error", { message: validation.error });
    }
    
    const result = await processMove(data);
    socket.emit("move-success", result);
  } catch (error) {
    logger.error("Move processing failed", error, { socketId: socket.id });
    socket.emit("error", { message: "Failed to process move" });
  }
});

// ❌ Bad - Unhandled errors
socket.on("make-move", (data) => {
  const result = processMove(data); // Could throw
  socket.emit("move-success", result);
});
```

**Socket Event Patterns**
```javascript
// ✅ Good - Consistent event handling pattern
class GameHandler {
  constructor(players, games) {
    this.players = players;
    this.games = games;
  }
  
  makeMove(socket) {
    socket.on("make-move", (data) => {
      const validation = this.validatePlayer(socket);
      if (!validation.valid) {
        return socket.emit("error", validation.error);
      }
      
      // Process move
    });
  }
  
  validatePlayer(socket) {
    const playerId = socket.playerId;
    if (!playerId || !this.players[playerId]) {
      return { valid: false, error: { message: "Player not found" } };
    }
    return { valid: true, player: this.players[playerId] };
  }
}

// ❌ Bad - Scattered validation and inconsistent patterns
socket.on("make-move", (data) => {
  if (!socket.playerId) {
    socket.emit("error", "No player");
    return;
  }
  // Inconsistent error format and validation
});
```

### Testing Guidelines

#### Frontend Testing
```javascript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { ChessBoard } from './ChessBoard';

describe('ChessBoard', () => {
  it('should handle piece movement', () => {
    const mockOnMove = jest.fn();
    render(<ChessBoard onMove={mockOnMove} />);
    
    const piece = screen.getByTestId('piece-e2');
    fireEvent.dragStart(piece);
    
    const targetSquare = screen.getByTestId('square-e4');
    fireEvent.drop(targetSquare);
    
    expect(mockOnMove).toHaveBeenCalledWith({
      from: 'e2',
      to: 'e4'
    });
  });
});
```

#### Backend Testing
```javascript
// Socket.io testing with socket.io-client
import { createServer } from 'http';
import { Server } from 'socket.io';
import Client from 'socket.io-client';

describe('Game Events', () => {
  let io, serverSocket, clientSocket;
  
  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      
      clientSocket.on('connect', done);
    });
  });
  
  test('should create game successfully', (done) => {
    clientSocket.emit('create-game', { gameOptions: {} });
    
    clientSocket.on('game-created', (data) => {
      expect(data).toHaveProperty('roomId');
      done();
    });
  });
});
```

### Pull Request Guidelines

#### PR Title Format
- `feat: add timer increment functionality`
- `fix: resolve socket disconnection issue`
- `docs: update API documentation`
- `refactor: improve game state management`
- `test: add chess move validation tests`

#### PR Description Template
```markdown
## Summary
Brief description of changes.

## Changes Made
- [ ] Added feature X
- [ ] Fixed bug Y
- [ ] Updated documentation Z

## Testing
- [ ] Manual testing completed
- [ ] Unit tests added/updated
- [ ] Integration tests pass

## Screenshots (if applicable)
Add screenshots for UI changes.

## Breaking Changes
List any breaking changes.

## Checklist
- [ ] Code follows project guidelines
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] Tested on multiple browsers (for frontend)
```

#### Review Process

1. **Automated Checks** - All CI checks must pass
2. **Code Review** - At least one maintainer review
3. **Testing** - Manual testing for significant changes
4. **Documentation** - Ensure docs are updated

## 🎨 UI/UX Contributions

### Design Guidelines

**Visual Design**
- Follow existing color scheme and typography
- Maintain consistent spacing using Tailwind classes
- Ensure accessibility (contrast ratios, keyboard navigation)
- Test on mobile and desktop screens

**User Experience**
- Keep user flows simple and intuitive
- Provide clear feedback for user actions
- Handle loading states and errors gracefully
- Follow chess game conventions where applicable

### Accessibility Requirements

- **Keyboard Navigation** - All interactive elements accessible via keyboard
- **Screen Readers** - Proper ARIA labels and semantic HTML
- **Color Contrast** - Minimum 4.5:1 ratio for normal text
- **Focus Indicators** - Clear focus states for all interactive elements

## 📚 Documentation Contributions

### Documentation Types

- **API Documentation** - Socket.io events and schemas
- **Component Documentation** - React component props and usage
- **Setup Guides** - Installation and deployment instructions
- **Tutorials** - Step-by-step guides for common tasks

### Writing Guidelines

- **Clear and Concise** - Use simple language
- **Code Examples** - Include relevant code snippets
- **Screenshots** - Add visuals for UI-related docs
- **Keep Updated** - Ensure accuracy with current codebase

## 🧪 Testing

### Manual Testing Checklist

**Basic Functionality**
- [ ] Create new game
- [ ] Join game with room code
- [ ] Make chess moves
- [ ] Game timer works correctly
- [ ] Resign/draw/abort functions work
- [ ] Play again functionality

**Edge Cases**
- [ ] Network disconnection/reconnection
- [ ] Invalid moves are rejected
- [ ] Game end conditions (checkmate, stalemate, timeout)
- [ ] Multiple browser tabs/windows
- [ ] Mobile device testing

**Browser Compatibility**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## 🚀 Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version bumped appropriately
- [ ] Changelog updated
- [ ] Deployment tested

## 📞 Getting Help

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Code Review** - Use PR comments for code-specific discussions

### Response Times

- **Bug Reports** - We aim to respond within 24-48 hours
- **Feature Requests** - Review within 1 week
- **Pull Requests** - Initial review within 3-5 days

## 🏆 Recognition

### Contributors

All contributors will be recognized in:
- **README** - Contributors section
- **CHANGELOG** - Release notes
- **GitHub** - Contributor graph and statistics

### Contribution Types

We recognize all types of contributions:
- 💻 Code
- 📖 Documentation  
- 🎨 Design
- 🐛 Bug Reports
- 💡 Ideas
- 🧪 Testing
- 📢 Outreach

## 📋 Code of Conduct

### Our Standards

**Positive Behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable Behavior:**
- Trolling, insulting, or derogatory comments
- Personal or political attacks
- Public or private harassment
- Publishing others' private information without permission

### Enforcement

Project maintainers are responsible for clarifying standards and taking corrective action in response to unacceptable behavior.

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to Two Player Chess! 🎯♟️