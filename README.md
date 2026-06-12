# 🔍 Photo Tagging App - Full Stack Challenge

A complete "Where's Waldo" style game where users find hidden characters in detailed photographs. Features zoomable images, mouse-follow scroll, JWT-based game state, and a leaderboard system.

## Learning Objectives

This project ties together everything learned so far:

- **Full Stack Integration** - Backend API + Frontend client
- **JWT Authentication** - Tamper-proof game state management
- **Coordinate Mapping** - Proportional positioning for zoomable images
- **Real-time Validation** - Server-side coordinate verification
- **Leaderboard System** - Time tracking and score submission

## Live Demo

[Play the Game](https://leandroesposito.github.io/top-photo-tagging/)

## Game Mechanics

### How It Works

1. **Select a photo** from available games
2. **Find hidden characters** listed in the sidebar
3. **Click on the image** where you think a character is located
4. **Select the character** from the dropdown menu
5. **Server validates** if coordinates match the character's location
6. **Timer tracks** your progress via JWT (tamper-proof)
7. **Submit your time** to the leaderboard when all found

### Core Feature: Proportional Coordinates

Since the image can be zoomed, coordinates are normalized:

```javascript
// Frontend - Convert click position to proportional coordinates (0-1 scale)
markerRelativePos = {
  x: event.offsetX / imgtag.clientWidth,
  y: event.offsetY / imgtag.clientHeight
};

// Backend - Validate against stored proportional boundaries
if (
  boundaries.leftbound < coords.x &&
  coords.x < boundaries.rightbound &&
  boundaries.topbound < coords.y &&
  coords.y < boundaries.bottombound
) {
  // Success! Character found
}
```

## JWT Game State Management

### The Problem

Client-side timers can be manipulated. Users could inspect the page and modify the timer.

### The Solution

Store game state in a **signed JWT token** on the server:

```javascript
// Server - Create token when game starts
function initToken(game) {
  const tokenData = {
    startTime: new Date(),           // Server timestamp
    gameId: game.id,
    objectives: {                    // Track which found
      1: false,  // Character 1 not found
      2: false,  // Character 2 not found
      3: false   // Character 3 not found
    }
  };
  
  const token = jwt.sign(tokenData, process.env.JWT_SECRET);
  return token;  // Client cannot modify this!
}
```

### Token Flow

```
1. User starts game
   Server → Client: JWT token (contains startTime + objectives status)

2. User finds character
   Client → Server: Token + coordinates
   Server verifies token signature
   Server validates coordinates against database
   Server updates objectives status in token
   Server → Client: New signed token

3. User finds all characters
   Server calculates total time using startTime in token
   Server adds totalTime to token
   Client submits final token to leaderboard
```

### Why This Is Secure

```javascript
// Client attempts to cheat - but CANNOT modify token!
const hackedToken = "eyJhbGciOiJIUzI1NiIs..."  // Modified payload
jwt.verify(hackedToken, SECRET)  // ❌ Invalid signature! Server rejects it
```

## Project Structure

```
photo-tagging-app/
├── index.js                 # Express server
├── controllers/             # Business logic
│   ├── game.js             # Game data & token creation
│   ├── try.js              # Coordinate validation
│   ├── leaderboard.js      # Score submission
│   └── validator-checker.js # Express-validator helper
├── db/                      # Database layer
│   ├── game.js             # Game queries
│   ├── objective.js        # Character boundary queries
│   ├── leaderboard.js      # Score queries
│   ├── pool.js             # PostgreSQL connection
│   ├── create_tables.js    # Schema creation
│   ├── drop_tables.js      # Schema cleanup
│   └── populate.js         # Seed data
├── routes/                  # API endpoints
├── client/                  # Frontend application
│   ├── index.html          # Main UI
│   ├── scripts.js          # Game logic
│   ├── api.js              # API service
│   ├── htmlCreator.js      # DOM generation
│   └── style.css           # Styling
└── errors/                  # Custom error classes
```

## Database Schema

```sql
-- Games table
CREATE TABLE games (
  id INT PRIMARY KEY,
  name TEXT,
  credits TEXT,
  pictureFilename TEXT,
  thumbnail TEXT
);

-- Objectives (characters to find)
CREATE TABLE objectives (
  id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT,
  pictureFilename TEXT,
  topBound REAL,     -- Proportional Y (0-1) for top edge
  leftBound REAL,    -- Proportional X (0-1) for left edge
  bottomBound REAL,  -- Proportional Y (0-1) for bottom edge
  rightBound REAL,   -- Proportional X (0-1) for right edge
  game_id INT REFERENCES games(id) ON DELETE CASCADE
);

-- Leaderboard
CREATE TABLE leaderboard (
  id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT,
  time TEXT,        -- Format: "00:01:30" (MM:SS:mmm)
  game_id INT REFERENCES games(id) ON DELETE CASCADE
);
```

## API Endpoints

### Public Routes

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/games` | List all available games |
| `GET` | `/games/:gameId` | Get game data + new JWT token |
| `GET` | `/leaderboard/:gameId` | Get leaderboard scores |
| `POST` | `/leaderboard/:gameId` | Submit final score (requires token) |
| `POST` | `/try` | Validate character attempt (requires token) |

### Request/Response Examples

#### Start Game
```http
GET /games/1

Response:
{
  "id": 1,
  "name": "Amusement Park",
  "pictureFilename": "1.jpg",
  "objectives": {
    "1": { "id": 1, "name": "Three-eyed pink", "pictureFilename": "1_1.png" },
    "2": { "id": 2, "name": "Green with antennae", "pictureFilename": "1_2.png" }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Submit Attempt
```http
POST /try
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "objectiveId": 1,
  "coords": { "x": 0.425, "y": 0.612 }
}

Response (success):
{
  "success": true,
  "objective": {
    "id": 1,
    "leftBound": 0.418,
    "rightBound": 0.435,
    "topBound": 0.605,
    "bottomBound": 0.622
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

Response (fail):
{
  "fail": true
}

Response (win - all found):
{
  "success": true,
  "objective": { ... },
  "win": true,
  "token": "eyJhbGciOiJIUzI1NiIs..."  // Contains totalTime
}
```

#### Submit Score
```http
POST /leaderboard/1
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIs...",  // Contains totalTime
  "name": "PlayerName"
}

Response:
{
  "success": true
}
```

## Frontend Features

### Interactive Gameplay

| Feature | Implementation |
|---------|----------------|
| **Zoom** | Mouse wheel or +/- buttons (10% increments up to 2x) |
| **Follow Mouse** | Viewport auto-scrolls to follow cursor |
| **Big Screen Mode** | Expands image container for better visibility |
| **Visual Feedback** | Character boxes appear on successful finds |
| **Marker** | Circular indicator at click position |

### Coordinate Conversion

```javascript
// scripts.js - Proportional coordinate calculation
function handleGameClick(event) {
  // Convert pixel click position to proportional (0-1 scale)
  const proportionalPos = {
    x: event.offsetX / imgtag.clientWidth,
    y: event.offsetY / imgtag.clientHeight
  };
  
  api.submitTry(objectiveId, proportionalPos);
}
```

### Zoom Implementation

```javascript
function updateZoom() {
  const naturalWidth = imgtag.naturalWidth;
  const naturalHeight = imgtag.naturalHeight;
  
  // Apply scale factor (scaleFactor = 1 = original size, 2 = double)
  imgtag.style.width = naturalWidth * scaleFactor + "px";
  imgtag.style.height = naturalHeight * scaleFactor + "px";
}
```

## Complete Game Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           GAME START                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User selects game → GET /games/1                                   │
│                           ↓                                         │
│  Server creates JWT with startTime + objectives status              │
│                           ↓                                         │
│  Frontend stores token in localStorage                              │
│  Frontend starts visual timer (client-side display only)            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         CHARACTER ATTEMPT                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User clicks on image at (proportional x, y)                        │
│                           ↓                                         │
│  Frontend shows dropdown of characters                              │
│                           ↓                                         │
│  User selects character → POST /try { token, objectiveId, coords }  │
│                           ↓                                         │
│  Server verifies token signature                                    │
│  Server checks if coordinates are within objective boundaries       │
│                           ↓                                         │
│  If success: Server updates objectives status in token              │
│              Server returns new signed token                        │
│              Frontend draws success box on image                    │
│                           ↓                                         │
│  If fail: Server returns { fail: true }                             │
│           Frontend shows error message                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          GAME COMPLETE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  All objectives found → Server calculates totalTime                 │
│                           ↓                                         │
│  Server adds totalTime to token                                     │
│  Server returns token with win: true                                │
│                           ↓                                         │
│  Frontend shows score submission form                               │
│                           ↓                                         │
│  User enters name → POST /leaderboard { token, name }               │
│                           ↓                                         │
│  Server verifies token and extracts totalTime                       │
│  Server saves score to database                                     │
│                           ↓                                         │
│  Frontend displays updated leaderboard                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Frontend API Service

```javascript
// api.js - Centralized API communication
async function makeRequest(endpoint, data) {
  const method = data ? "POST" : "GET";
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
    mode: "cors",
  };

  if (data) {
    data.token = localStorage.getItem("token");  // Auto-add token
    options.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, options);
  const json = await response.json();
  
  if (json.token) {
    localStorage.setItem("token", json.token);  // Update stored token
  }
  
  return json;
}
```

## UI Features

### Zoom Controls
- **Mouse wheel** - Scroll up/down to zoom in/out
- **+/- buttons** - Increment/decrement zoom by 10%
- **Zoom range** - From original size up to 200%

### Follow Mouse Mode
- Checkbox enables/disables auto-scroll
- When enabled, viewport follows cursor position
- Useful for exploring large images

### Big Screen Mode
- Expands image container to full height
- Moves objectives inside the viewport
- Optimized for desktop play

### Visual Feedback
| Element | Indicates |
|---------|-----------|
| **Pulsing marker** | Click position |
| **Green outline box** | Successfully found character |
| **Green card** | Found character in sidebar |
| **Flash message** | Success/failure feedback |
| **Leaderboard** | Top scores with times |

## Key Takeaways

### Security (JWT)
- **Server-side time** - Start time stored in signed token, not client
- **Tamper-proof** - Token signature verification prevents modification
- **Stateless** - No session storage needed on server
- **Token rotation** - New token issued after each successful find

### Coordinate System
- **Proportional scaling** - Coordinates stored as 0-1 values
- **Zoom-agnostic** - Works regardless of zoom level
- **Precision** - REAL type in database for floating point accuracy

### Full Stack Integration
- **Single token** - Carries all game state throughout session
- **Atomic validation** - Each attempt independently verified
- **Leaderboard** - Only final tokens with totalTime can submit

### User Experience
- **Instant feedback** - Visual indicator for each find
- **No cheating** - Timer is decorative; actual time from server
- **Persistent state** - Page refresh loses token (starts new game)

## Running the Project

```bash
# Install dependencies
npm install

# Set up environment variables (.env)
SERVER_PORT=3000
DATABASE_URL_PROD="postgresql://user:password@localhost:5432/phototag"
JWT_SECRET="your_super_secret_key"

# Initialize database
node db/populate.js

# Start server
node index.js

# Serve frontend (separate server or static)
cd client
python -m http.server 8080
```

## Database Seeding

The `populate.js` script contains:
- 6 game images with artist credits
- 40+ characters with precise proportional boundaries
- Sample leaderboard scores for testing

## Learning Resources

- [JWT.io](https://jwt.io/) - JSON Web Token specification
- [Express.js](https://expressjs.com/) - Backend framework
- [PostgreSQL](https://www.postgresql.org/) - Database

