# Two Player Chess

A real-time multiplayer chess game built with React, Node.js, and Socket.io. Play chess with friends online with a modern, responsive interface.

![Two Player Chess](Two%20Player%20Chess.png)

## 🎯 Features

- **Real-time Multiplayer**: Play chess with friends in real-time using Socket.io
- **Game Rooms**: Create or join game rooms with unique room codes  
- **Interactive Chess Board**: Drag-and-drop piece movement with visual feedback
- **Game Timer**: Configurable time controls for each player
- **Game Options**: 
  - Resign game
  - Offer/Accept/Reject draws
  - Play again functionality
  - Abort games
- **Player Management**: Track player data and handle reconnections
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI
- **Admin Dashboard**: Socket.io admin UI for monitoring connections

## 🏗️ Architecture

This project follows a client-server architecture:

### Backend (Node.js)
- **Express.js** - Web server framework
- **Socket.io** - Real-time bidirectional communication
- **Chess.js** - Chess game logic and validation
- **UUID** - Generate unique identifiers for games and players

### Frontend (React)
- **React 19** - UI framework with hooks and context
- **Vite** - Fast build tool and dev server  
- **Socket.io Client** - Real-time communication with server
- **react-chessboard** - Interactive chess board component
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Chess.js** - Client-side chess logic

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aman-Maurya-coder/Two_Player_Chess.git
   cd Two_Player_Chess
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The server will start on `http://localhost:3000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

### Building for Production

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Preview the production build**
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
Two_Player_Chess/
├── backend/                 # Node.js backend server
│   ├── handlers/           # Socket.io event handlers
│   │   ├── gameHandlers.js # Game-related events
│   │   └── playerHandlers.js # Player-related events
│   ├── package.json        # Backend dependencies
│   └── server.js          # Main server file
├── frontend/              # React frontend application
│   ├── public/           # Static assets
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── App.jsx       # Main App component
│   │   └── main.jsx      # Entry point
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
├── .vscode/              # VS Code settings
└── README.md            # This file
```

## 🎮 How to Play

1. **Create a Game**: Click "Create Game" to start a new chess game
2. **Share Room Code**: Share the generated room code with your friend
3. **Join Game**: Your friend can join using the room code
4. **Play Chess**: Take turns moving pieces on the board
5. **Game Options**: Use in-game buttons to resign, offer draws, or play again

## 🔧 Configuration

### Backend Configuration

The backend server can be configured by modifying `backend/server.js`:

- **Port**: Default is 3000, can be changed in the `httpServer.listen()` call
- **CORS Origins**: Modify the `allowedOrigins` array for production domains
- **Socket.io Settings**: Adjust reconnection settings and authentication

### Frontend Configuration  

The frontend can be configured by modifying:

- **Backend URL**: Change the `url` variable in `frontend/src/App.jsx`
- **Vite Settings**: Modify `frontend/vite.config.js` for build configurations
- **Tailwind**: Customize styles in `frontend/tailwind.config.js`

## 📚 API Documentation

### Socket.io Events

#### Player Events
- `player-join` - Player joins the game
- `get-player-data` - Retrieve player information
- `rejoin-game` - Rejoin an existing game
- `rejoin-cancel` - Cancel rejoin attempt

#### Game Events  
- `create-game` - Create a new game room
- `join-game` - Join an existing game room
- `get-room-data` - Get room information
- `get-game-data` - Get current game state
- `make-move` - Make a chess move
- `abort-game` - Abort the current game
- `resign-game` - Resign from the game
- `offer-draw` - Offer a draw
- `accept-draw` - Accept a draw offer
- `reject-draw` - Reject a draw offer
- `play-again` - Request to play again
- `accept-play-again` - Accept play again request
- `reject-play-again` - Reject play again request
- `close-room` - Close the game room

For detailed event schemas and examples, see [API.md](docs/API.md).

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- **Frontend**: ESLint configuration is provided - run `npm run lint`
- **Backend**: Follow Node.js best practices and consistent formatting
- **Commits**: Use conventional commit messages

## 🧪 Testing

Currently, the project uses manual testing. To test:

1. Start both backend and frontend servers
2. Open multiple browser tabs/windows
3. Create a game in one tab and join from another
4. Test all game features and edge cases

## 🚢 Deployment

### Backend Deployment

1. Set environment variables for production
2. Configure CORS origins for your domain
3. Use a process manager like PM2
4. Set up reverse proxy with Nginx/Apache

### Frontend Deployment

1. Build the production bundle: `npm run build`
2. Deploy the `dist/` folder to your hosting provider
3. Configure environment variables for the backend URL

For detailed deployment instructions, see [DEPLOYMENT.md](docs/DEPLOYMENT.md).

## 🐛 Troubleshooting

### Common Issues

1. **Connection Issues**: Ensure both servers are running and ports are correct
2. **CORS Errors**: Check the CORS configuration in `backend/server.js`
3. **Build Errors**: Clear `node_modules` and reinstall dependencies
4. **Socket Disconnections**: Check network connectivity and reconnection settings

### Getting Help

- Check the [Issues](https://github.com/Aman-Maurya-coder/Two_Player_Chess/issues) page
- Create a new issue with detailed description and steps to reproduce

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Aman Maurya** - [GitHub Profile](https://github.com/Aman-Maurya-coder)

## 🙏 Acknowledgments

- [Chess.js](https://github.com/jhlywa/chess.js) - Chess game logic
- [react-chessboard](https://github.com/Clariity/react-chessboard) - React chess board component
- [Socket.io](https://socket.io/) - Real-time communication
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI components

---

**Happy Coding! ♟️**