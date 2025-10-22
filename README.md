# VishAI

VishAI is a full-stack demo application (MERN-style) that provides a simple AI chat interface. The repository contains a backend (Node/Express) and a frontend (Vite + React). The app demonstrates user authentication, chat message storage, and an AI service integration for generating or processing chat responses.

## Repository structure

- `backend/` - Express server, API routes, controllers, models, and services
  - `server.js` - Entry point for the backend server
  - `package.json` - Backend dependencies and scripts
  - `config/db.js` - Database connection setup
  - `controllers/` - Route handlers (`authController.js`, `chatController.js`)
  - `middleware/` - Auth middleware (`authMiddleware.js`)
  - `models/` - Mongoose models (`user.model.js`, `chat.model.js`)
  - `routes/` - Route definitions for auth, chat, and user
  - `services/aiService.js` - Wrapper/service for AI interactions
  - `utils/jwt.js` - JWT helper functions

- `frontend/` - React app built with Vite
  - `src/` - Source files
    - `components/Chat.jsx` - Chat UI component
    - `components/Navbar.jsx` - Navigation bar
    - `Pages/` - `Home.jsx`, `Login.jsx`, `Signup.jsx`
    - `services/api.js` - API client for frontend requests
  - `package.json` - Frontend dependencies and scripts

## Requirements

- Node.js (16+ recommended)
- npm or yarn
- MongoDB instance (local or remote)

## Environment variables

Create a `.env` file in the `backend/` directory with the following variables (names inferred from code):

- `PORT` - Port for the backend server (e.g., `5000`)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret used to sign JWT tokens
- `OPENAI_API_KEY` (optional) - If `aiService.js` uses OpenAI or other AI provider

Example `backend/.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/vishai
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=sk-...
```

Note: Do not commit `.env` or any secret keys to version control. `.gitignore` should already include `.env`.

## Backend - Install & Run

1. Install dependencies

```powershell
cd backend; npm install
```

2. Start the server (development)

```powershell
cd backend; npm run dev
```

Or start production mode

```powershell
cd backend; npm start
```

The backend server should be reachable at `http://localhost:5000` (or the `PORT` you set).

## Frontend - Install & Run

1. Install dependencies

```powershell
cd frontend; npm install
```

2. Start the dev server

```powershell
cd frontend; npm run dev
```

Open the app in the browser at the URL shown in the terminal (Vite usually serves at `http://localhost:5173`).

## API Endpoints (inferred)

- `POST /api/auth/signup` - Create a new user (signup)
- `POST /api/auth/login` - Authenticate user and return a JWT
- `GET /api/user/me` - Get current user's profile (protected)
- `GET /api/chat` - Get chat history for the user (protected)
- `POST /api/chat` - Post a new chat message (protected)

Refer to files in `backend/routes/` and `backend/controllers/` for exact route paths and request/response shapes.

## Frontend usage (inferred)

- The frontend contains `Login` and `Signup` pages to authenticate users and a `Chat` component to send/receive messages.
- The `services/api.js` module should handle attaching the JWT token to requests and calling the backend endpoints.

## Development notes & assumptions

- The README was generated from the repository file layout and common patterns. Specific environment variable names and exact route paths were inferred from typical Express/Mongoose projects; if names differ, adjust the `.env` and commands accordingly.
- If the AI integration uses a different provider or requires additional credentials, add those keys to the `backend/.env` and update `services/aiService.js` accordingly.

## Tests

No automated tests were detected in the repository. If you add tests, include instructions here for running them (e.g., `npm test`).

## Next steps / Suggestions

- Add a `README` section with sample requests, request/response JSON examples, and screenshots of the UI.
- Add a `Makefile` or root-level npm scripts to start both frontend and backend together (for developer convenience).
- Add basic tests (backend API tests and frontend component tests).

## License

Add a license file (e.g., `LICENSE`) if you plan to open-source the project.

---

If you'd like, I can:
- Add a root `package.json` script to run both services together using `concurrently`.
- Expand the README with exact request/response examples by reading specific controller and model files.

Tell me which of those you'd like next.
