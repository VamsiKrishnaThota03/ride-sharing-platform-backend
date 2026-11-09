# Ride-Sharing Platform: Backend

REST + WebSocket API for a ride-safety sharing app: travelers share their cab details with a companion, companions follow the trip and leave feedback, admins review users and feedback.

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-6.x-52B0E7?logo=sequelize&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)

## Overview

This is the standalone backend of the Ride-Sharing Platform. It is an Express server with:

- **JWT authentication** and role-based access for three roles: `traveler`, `traveler_companion` and `admin`
- **Sequelize models** for users, shared rides and feedback, stored in PostgreSQL. This version connects over SSL, which suits hosted Postgres such as Supabase.
- **A WebSocket server** (`ws`) on the same port. Clients connect per trip (`?tripId=...`), and a trip is marked inactive when a client reports that the destination was reached.

### Related repositories

| Repository | What it contains |
|------------|------------------|
| [ride-sharing-platform-backend](https://github.com/VamsiKrishnaThota03/ride-sharing-platform-backend) | **This repo**: the API, split out for separate deployment |
| [ride-sharing-platform-frontend](https://github.com/VamsiKrishnaThota03/ride-sharing-platform-frontend) | React client that uses this API (via `REACT_APP_BACKEND_URL`) |
| [Ride-Sharing-Platform](https://github.com/VamsiKrishnaThota03/Ride-Sharing-Platform) | Original monorepo with the frontend and backend together (earlier, localhost-only version) |

## Features

- Sign-up with bcrypt password hashing (`bcryptjs`) and login that returns a 1-hour JWT (contains id, email, role and mobile number)
- On login, companions also get the rides that were shared with their mobile number
- Travelers can save a shared ride (trip ID, driver name, driver phone, cab number, companion mobile) and list their own shared rides, newest first
- Companions can list every ride shared with their mobile number
- Travelers and companions can submit feedback (rating and an optional comment) for a ride
- Admin-only endpoints list all users and all feedback
- WebSocket per trip: connections are rejected if `tripId` is missing or the trip is not active, and a `destinationReached` message sets the ride to inactive
- `sequelize.sync()` creates the tables on startup

## Tech stack

- Node.js, Express 4, `body-parser`, `cors`
- Sequelize 6 with `pg` / `pg-hstore` (PostgreSQL)
- `jsonwebtoken`, `bcryptjs`
- `ws` for WebSockets
- `dotenv` for configuration

## Project structure

```
.
├── server.js               # Express app, route mounting, WebSocket server, DB sync
├── config/db.js            # Sequelize connection (PostgreSQL over SSL)
├── models/                 # User, RideShare, Feedback
├── controllers/            # auth, ride, feedback, admin, user handlers
├── routes/                 # authRoutes, rideRoutes, feedbackRoutes, adminRoutes
├── middleware/
│   ├── authMiddleware.js   # Verifies Bearer JWT
│   └── adminMiddleware.js  # Verifies JWT and checks the allowed roles
└── utils/jwtUtils.js       # Token generation
```

## Getting started

### Prerequisites

- Node.js 18+ and npm
- A PostgreSQL database that accepts SSL connections (for example a Supabase project)

### Install

```bash
git clone https://github.com/VamsiKrishnaThota03/ride-sharing-platform-backend.git
cd ride-sharing-platform-backend
npm install
```

### Environment variables

Create a `.env` file in the project root:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `<your-db-host>` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `<your-db-name>` |
| `DB_USER` | Database user | `<your-db-user>` |
| `DB_PASSWORD` | Database password | `<your-db-password>` |
| `JWT_SECRET` | Secret used to sign and verify JWTs | `<a-long-random-string>` |
| `PORT` | Read from `.env`, but the server currently listens on a fixed port, **5001** | `5001` |

### Run

```bash
npm start          # node server.js -> http://localhost:5001
# or, for auto-reload during development:
npx nodemon server.js
```

## API

All REST routes are prefixed with `/api`. Protected routes expect `Authorization: Bearer <token>`.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/signup` | none | Register a user (`name`, `email`, `mobile_number`, `password`, `role`) |
| `POST` | `/api/login` | none | Log in; returns a JWT and role (companions also get their shared rides) |
| `GET` | `/api/user/profile` | any logged-in user | Current user's profile (password excluded) |
| `POST` | `/api/rides/share` | any logged-in user | Save a shared ride (`tripId`, `driverName`, `driverPhone`, `cabNumber`, `companionMobile`) |
| `GET` | `/api/rides/shared` | any logged-in user | Rides shared by the current user, newest first |
| `GET` | `/api/rides/companion/details` | any logged-in user | Rides whose `companionMobile` matches the current user's mobile number |
| `POST` | `/api/feedback/send` | `traveler`, `traveler_companion` | Submit feedback (`rideShareId`, `rating`, `comment`) |
| `GET` | `/api/admin/users` | `admin` | List all users |
| `GET` | `/api/admin/feedbacks` | `admin` | List all feedback |

### WebSocket

| URL | Behaviour |
|-----|-----------|
| `ws://<host>:5001/?tripId=<tripId>` | Accepted only if an active ride with that `tripId` exists. Sending `{"type":"destinationReached"}` marks the ride inactive. |

## Data model

| Model | Fields |
|-------|--------|
| `User` | `name`, `email` (unique), `mobile_number`, `password` (hashed), `role` (`traveler` / `traveler_companion` / `admin`) |
| `RideShare` | `tripId`, `driverName`, `driverPhone`, `cabNumber`, `companionMobile`, `userId`, `isActive` |
| `Feedback` | `rideShareId`, `userId`, `rating`, `comment` |

All tables include Sequelize `createdAt` / `updatedAt` timestamps.

## Contact

Thota Vamsi Krishna — [GitHub](https://github.com/VamsiKrishnaThota03)
