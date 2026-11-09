> **📦 Archived:** this repo is kept for history. Active development continues in the combined repository **[Ride-Sharing-Platform](https://github.com/VamsiKrishnaThota03/Ride-Sharing-Platform)**, which contains the same frontend and backend code.

# Ride-Sharing Platform: Backend

REST + WebSocket API for a ride-safety sharing app: travelers share their cab details with a companion, companions follow the trip and leave feedback, admins review users and feedback.

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-6.x-52B0E7?logo=sequelize&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)

## Overview

This is the standalone backend of the Ride-Sharing Platform. It is an Express server with:

- **JWT authentication** and role checks for `traveler`, `traveler_companion` and `admin`
- **Sequelize models** for users, shared rides and feedback, stored in PostgreSQL (SSL by default, which suits Supabase). SQLite can be used for local development and tests.
- **An authenticated WebSocket server** (`ws`) on the same port. The trip owner streams positions to the companion, and companions get "nearby" and "trip complete" notifications.

### Related repositories

| Repository | What it contains |
|------------|------------------|
| [ride-sharing-platform-backend](https://github.com/VamsiKrishnaThota03/ride-sharing-platform-backend) | **This repo**: the API, deployed separately |
| [ride-sharing-platform-frontend](https://github.com/VamsiKrishnaThota03/ride-sharing-platform-frontend) | React client that uses this API (via `REACT_APP_BACKEND_URL`) |
| [Ride-Sharing-Platform](https://github.com/VamsiKrishnaThota03/Ride-Sharing-Platform) | Monorepo with the same frontend and backend together |

## Features

- Sign-up with bcrypt password hashing and validation; login returns a 1-hour JWT (id, email, role, mobile number)
- Self-service sign-up only for travelers and companions; admins come from `ADMIN_EMAILS`
- Password hashes are never returned (sign-up response, profile, admin user list)
- Travelers save shared rides (unique trip IDs), list them and mark them completed
- Companions list rides shared with their mobile number; companions with no rides can still log in
- Feedback (rating 1-5 and an optional comment) only from the traveler or the companion of that ride
- Admin endpoints for all users and all feedback
- WebSocket: token required, only the trip owner, its companion or an admin can join; malformed messages are ignored
- JSON errors, health route, CORS allow list, `PORT` from the environment

## Tech stack

- Node.js 18+, Express 4, `cors`, `express-validator`
- Sequelize 6 with `pg` / `pg-hstore` (PostgreSQL), `sqlite3` for development and tests
- `jsonwebtoken`, `bcryptjs`
- `ws` for WebSockets
- `dotenv` for configuration
- `node:test` for tests

## Project structure

```
.
├── server.js               # checks config, connects the DB, starts HTTP + WebSocket
├── app.js                  # Express app: CORS, routes, 404 and error handlers
├── realtime.js             # trip WebSocket and companion notifications
├── config/
│   ├── env.js              # requireEnv / listEnv helpers
│   └── db.js               # Sequelize connection (DATABASE_URL, DB_* or SQLite)
├── models/                 # User, RideShare, Feedback
├── controllers/            # auth, user, ride, feedback, admin
├── routes/                 # authRoutes, rideRoutes, feedbackRoutes, adminRoutes
├── middleware/
│   ├── authMiddleware.js   # Bearer JWT check and requireRole(...)
│   └── validate.js         # express-validator error handler
├── utils/jwtUtils.js       # sign / verify tokens
└── test/api.test.js        # API and WebSocket tests on in-memory SQLite
```

## Getting started

```bash
git clone https://github.com/VamsiKrishnaThota03/ride-sharing-platform-backend.git
cd ride-sharing-platform-backend
npm install
cp .env.example .env     # then fill in the values
npm run dev              # nodemon; or: npm start  -> http://localhost:5001
npm test                 # no database needed
```

For a quick local run without PostgreSQL, set `DB_DIALECT=sqlite` (and remove the `DB_*` lines) in `.env`.

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Long random string used to sign JWTs |
| `DATABASE_URL` | One DB option | Full PostgreSQL URL, for example `postgres://user:password@host:5432/postgres` |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | One DB option | PostgreSQL connection parts (the Supabase pooler uses port `6543`) |
| `DB_SSL` | No | `false` to connect to a local PostgreSQL without SSL (default `true`) |
| `DB_DIALECT`, `DB_STORAGE` | One DB option | `DB_DIALECT=sqlite` uses a local SQLite file (`DB_STORAGE`, default `dev.sqlite`). For local development only; `sqlite3` is a dev dependency |
| `ADMIN_EMAILS` | No | Comma-separated emails that get the admin role when they sign up |
| `CORS_ORIGIN` | No | Comma-separated allowed browser origins, for example `https://ride-sharing-platform-frontend.vercel.app`. Empty allows every origin |
| `PORT` | No | HTTP and WebSocket port, default `5001` |

The server exits with a clear message if `JWT_SECRET` or a database setting is missing, and creates the tables on start (`sequelize.sync()`).

## API

REST routes are prefixed with `/api`. Protected routes expect `Authorization: Bearer <token>`. Errors are returned as `{ "message": "..." }`.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/` | none | Health check |
| `POST` | `/api/signup` | none | Register (`name`, `email`, `mobile_number` (10 digits), `password` (6+), `role`: `traveler` or `traveler_companion`) |
| `POST` | `/api/login` | none | Log in; returns `token`, `role`, `mobile_number` (companions also get `rideShareDetails`) |
| `GET` | `/api/user/profile` | any user | Current profile (password excluded) |
| `PUT` | `/api/user/profile` | any user | Update `name`, `email`, `mobile_number` |
| `POST` | `/api/rides/share` | `traveler` | Save a shared ride (`tripId`, `driverName`, `driverPhone`, `cabNumber`, `companionMobile`) |
| `GET` | `/api/rides/shared` | any user | Rides shared by the current user, newest first |
| `POST` | `/api/rides/expire` | `traveler` (owner) | Mark one of your rides as completed (`tripId`) |
| `GET` | `/api/rides/companion/details` | `traveler_companion` | Rides shared with your mobile number |
| `POST` | `/api/feedback/send` | `traveler`, `traveler_companion` | Feedback (`rideShareId` = trip ID, `rating` 1-5, `comment`) for a ride you shared or were the companion on |
| `GET` | `/api/admin/users` | `admin` | All users (passwords excluded) |
| `GET` | `/api/admin/feedbacks` | `admin` | All feedback |

### WebSocket

The WebSocket server runs on the same port. Every connection needs a valid token.

| URL | Who | Behaviour |
|-----|-----|-----------|
| `ws://<host>/?tripId=<id>&token=<jwt>` | Trip owner, its companion or an admin | Joins an active trip. The owner sends `{"type":"updatePosition","lat":..,"lon":..}` (relayed to the other viewers as `position`), `{"type":"nearby"}` and `{"type":"destinationReached"}` (marks the ride inactive). |
| `ws://<host>/?token=<jwt>` | Companion | Receives `nearbyNotification` and `tripComplete` messages for rides shared with them |

## Data model

| Model | Fields |
|-------|--------|
| `User` | `name`, `email` (unique), `mobile_number`, `password` (hashed), `role` (`traveler` / `traveler_companion` / `admin`) |
| `RideShare` | `tripId`, `driverName`, `driverPhone`, `cabNumber`, `companionMobile`, `userId`, `isActive` |
| `Feedback` | `rideShareId` (trip ID), `userId`, `rating` (1-5), `comment` |

All tables include Sequelize `createdAt` / `updatedAt` timestamps.

## Deployment notes (Render)

- Set `JWT_SECRET`, the database settings (`DATABASE_URL` or `DB_*`), `ADMIN_EMAILS` and `CORS_ORIGIN`. `PORT` is provided by Render.
- `.env` with live Supabase credentials and the JWT secret used to be committed. It is no longer tracked but is still in the git history: rotate the database password and the JWT secret.
- The WebSocket now requires `?token=`; deploy the updated frontend together with this backend.

## Known limitations

- No rate limiting on login or sign-up, and no refresh tokens.
- Ride expiry after 60 minutes is shown by the frontend only; the server keeps a ride active until the owner ends it or the trip reaches its destination.
- `npm audit` reports a moderate issue in Sequelize's `uuid` dependency (fix requires a breaking change) and issues in the `sqlite3` build tooling (development only).

## Contact

Thota Vamsi Krishna — [GitHub](https://github.com/VamsiKrishnaThota03)
