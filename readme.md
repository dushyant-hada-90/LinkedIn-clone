# Vibe — Modern Social Networking Platform

A full-stack social networking application built with **NestJS**, **React 19**, **TypeScript**, and **MongoDB**. Features real-time messaging, a rich profile system, connection management, and a beautiful dark/light theme.

---

## Features

- **Authentication** — Email/password signup & login with JWT (httpOnly cookies), Google OAuth
- **Rich Profiles** — Cover image, avatar, headline, location, skills, experience, education with inline editing
- **Posts & Feed** — Create posts with images (Cloudinary), like, comment (add/edit/delete), infinite scroll
- **Connections** — Send/accept/reject/remove connection requests with real-time notifications
- **Direct Messaging** — Full chat UI with Socket.io, typing indicators, read receipts, conversation list
- **Real-Time Notifications** — Likes, comments, connection requests, messages delivered instantly
- **Dark/Light Theme** — Teal + Warm Gray palette with smooth toggle and system preference detection
- **Responsive Design** — Mobile-first layouts across all pages

## Tech Stack

### Backend
- **NestJS 11** — Modular architecture with decorators & guards
- **Mongoose 9** — MongoDB ODM with TypeScript schemas
- **Socket.io** — WebSocket gateway for real-time features
- **Passport JWT** — Authentication with access/refresh token rotation
- **Cloudinary** — Image upload & management
- **class-validator** — DTO validation

### Frontend
- **React 19** + **TypeScript** — Modern component architecture
- **Vite 7** — Lightning-fast dev server & builds
- **Tailwind CSS v4** — Utility-first styling with CSS variable theming
- **Radix UI** — Accessible primitives (Dialog, DropdownMenu, Tabs, etc.)
- **lucide-react** — Beautiful consistent icons
- **Socket.io Client** — Real-time communication
- **Axios** — HTTP client with credentials
- **date-fns** — Date formatting

## Project Structure

```
├── backend/
│   └── src/
│       ├── main.ts                  # Entry point
│       ├── app.module.ts            # Root module
│       ├── common/                  # Decorators & guards
│       ├── gateways/                # Socket.io WebSocket gateway
│       ├── modules/
│       │   ├── auth/                # Login, signup, Google OAuth, JWT
│       │   ├── users/               # Profile CRUD, search
│       │   ├── posts/               # Feed, likes, comments
│       │   ├── connections/         # Connection requests
│       │   ├── messages/            # Conversations & DMs
│       │   └── notifications/       # In-app notifications
│       └── providers/
│           └── cloudinary/          # Image upload service
│
├── frontend/
│   └── src/
│       ├── main.tsx                 # Entry with providers
│       ├── App.tsx                  # Routes & protected layout
│       ├── context/                 # Session, Theme, Socket providers
│       ├── components/
│       │   ├── layout/              # NavBar, Spinner
│       │   ├── feed/                # PostComposer, PostCard, CommentSection
│       │   └── ui/                  # Button, Card, Dialog, Avatar, etc.
│       ├── pages/                   # Feed, Profile, Network, Messages, Login, Signup
│       ├── hooks/                   # useInfiniteScroll
│       ├── lib/                     # API modules, utilities
│       └── types.ts                 # Shared TypeScript interfaces
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- Cloudinary account (for image uploads)
- Google OAuth Client ID (for social login)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/vibe
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GOOGLE_CLIENT_ID=your_google_client_id

FRONTEND_URL=http://localhost:5173
PORT=5000
```

```bash
npm run dev    # Start with ts-node-dev (hot reload)
npm run build  # Compile TypeScript
npm start      # Run compiled JS
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

```bash
npm run dev    # Start Vite dev server
npm run build  # Production build
```

### Access

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)

## Design

- **Color Palette**: Teal primary (#0D9488) with warm gray neutrals
- **Dark Mode**: Full dark theme with smooth transitions
- **Typography**: System font stack for performance
- **Animations**: Fade-in, slide-up, scale-in transitions throughout

## Security Architecture

```mermaid
sequenceDiagram
    participant C as Client (React)
    participant A as API (NestJS)
    participant G as Gateway (Socket.io)
    participant DB as MongoDB
    participant AI as Gemini AI
    participant CL as Cloudinary

    Note over C, DB: Authentication Flow
    C->>A: POST /auth/login { email, password }
    A->>DB: Verify credentials (bcrypt)
    DB-->>A: User document
    A->>A: Sign JWT (access + refresh)
    A-->>C: Set httpOnly cookies + user payload

    Note over C, A: Authenticated API Requests
    C->>A: GET /posts (Cookie: access_token)
    A->>A: JwtAuthGuard extracts & verifies token
    A->>A: @CurrentUser() decorator injects userId
    A->>DB: Query with userId context
    DB-->>A: Results
    A-->>C: JSON response

    Note over C, A: Token Refresh
    C->>A: POST /auth/refresh (Cookie: refresh_token)
    A->>A: Verify refresh token
    A-->>C: New access_token cookie

    Note over C, G: WebSocket Connection
    C->>G: ws:// upgrade (Cookie: access_token)
    G->>G: Parse cookie → verify JWT
    alt Valid Token
        G->>G: Map userId → socket.id
        G-->>C: Connection established
    else Invalid / Missing
        G-->>C: Disconnect
    end

    Note over C, G: Real-Time Messaging (Rate Limited)
    C->>G: send_message { receiverId, content }
    G->>G: WsThrottlerGuard (30 req / 60s)
    G->>DB: Save message + update conversation
    G-->>C: message_sent confirmation
    G->>G: Emit to receiver's room

    Note over C, AI: Smart Connect (AI Icebreaker)
    C->>A: GET /connections/:userId/icebreaker
    A->>DB: Load sender + receiver profiles
    A->>AI: Gemini 2.0 Flash (structured JSON)
    AI-->>A: { greeting, options[], sharedInterests[] }
    A->>A: Validate with Zod schema
    A-->>C: Icebreaker suggestions

    Note over C, CL: Image Upload
    C->>A: POST /posts (multipart/form-data)
    A->>A: Multer middleware saves to tmp/
    A->>CL: Upload image buffer
    CL-->>A: { url, publicId }
    A->>DB: Save post with image URL
    A-->>C: Created post
```

### Key Security Features

| Layer | Mechanism | Details |
|-------|-----------|---------|
| **Auth** | JWT httpOnly cookies | Access (15m) + Refresh (7d) tokens |
| **Passwords** | bcryptjs | Salted hashing, never stored in plain text |
| **API** | `@UseGuards(JwtAuthGuard)` | All protected routes require valid JWT |
| **WebSocket** | Cookie-based JWT verification | On connection, not per-message |
| **Rate Limiting** | `@nestjs/throttler` | HTTP: 5/1s, 30/10s, 100/60s; WS: per-handler |
| **Validation** | `class-validator` + Zod | DTOs whitelist & strip unknown fields |
| **CORS** | Origin-locked | Only `FRONTEND_URL` allowed |
| **Uploads** | Cloudinary | No direct FS access, CDN delivery |

## Author

**Dushyant**

---

> Built with modern web technologies. Designed for a great developer experience and a polished user interface.
