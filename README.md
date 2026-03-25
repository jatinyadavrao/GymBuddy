# GymBuddy - MERN Gym Partner Matching App

GymBuddy is a production-style MERN application inspired by Tinder, but built for finding compatible gym partners nearby.

## Tech Stack

### Frontend
- React + Vite (JavaScript)
- Tailwind CSS
- Axios
- React Router
- Framer Motion
- Socket.io client

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Socket.io
- Gemini API integration (`@google/generative-ai`)
- Cloudinary + multer for image upload
- bcrypt, dotenv, cors, express-rate-limit

## Folder Structure

```bash
gymbuddy/
  client/
    src/
      components/
      pages/
      hooks/
      context/
      services/
      utils/
      App.jsx
      main.jsx
  server/
    controllers/
    routes/
    models/
    middleware/
    services/
    utils/
    config/
    server.js
  README.md
```

## Core Features

- JWT auth (register/login)
- User profile with fitness preferences
- Tinder-style swipe like/dislike
- Auto-match when both users like each other
- Real-time chat with Socket.io
- Typing indicator and read-receipt events
- AI Profile Analyzer (Gemini)
- AI Compatibility Analyzer (Gemini)
- AI Icebreakers (Gemini)
- AI Workout Suggestions
- Distance filtering and gym name search
- Workout calendar + streak tracking
- Profile verification
- Push notification token registration (provider-ready stub)
- Recommendation caching + pagination

## API Routes

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### User
- `GET /api/users/me`
- `PUT /api/users/update`
- `GET /api/users/recommendations`
- `PUT /api/users/workout-calendar`
- `PUT /api/users/verify`
- `PUT /api/users/push-token`

### Matching
- `POST /api/swipe/like`
- `POST /api/swipe/dislike`
- `GET /api/matches`

### Chat
- `GET /api/chat/:matchId`
- `POST /api/chat/message`

### AI
- `POST /api/ai/analyze-bio`
- `POST /api/ai/compatibility`
- `POST /api/ai/icebreakers`
- `GET /api/ai/workout-suggestions`

## Local Setup

## 1. Clone / open workspace

Open the `gymbuddy` folder in VS Code.

## 2. Backend setup

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Set `.env` values:
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `GEMINI_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## 3. Frontend setup

```bash
cd ../client
cp .env.example .env
npm install
npm run dev
```

Client runs on `http://localhost:5173`, server on `http://localhost:5000`.

## Compatibility Algorithm

GymBuddy recommendation score:
- Same gym location: +30
- Fitness goals overlap: +20
- Workout schedule overlap: +20
- Interests overlap: +20
- Same fitness level: +10

Total score range: 0 to 100. Recommendations are sorted descending.

## Notes

- Push notification service is implemented as a provider-ready stub (`notificationService.js`). Integrate FCM/APNs for production push delivery.
- Socket events are implemented for room join, typing, stop typing, and read receipts.
- This codebase is structured as a startup-style baseline and is ready for local development.
