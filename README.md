# End2End

Privacy-first chat platform with a Next.js client and a NestJS backend, built to evolve into full end-to-end encrypted messaging.

## Overview

This repository contains two apps:

- `e2ee-client`: Next.js (App Router) frontend
- `e2ee-server`: NestJS API + Socket.IO realtime gateway + Prisma/PostgreSQL

Current implementation already includes:

- Recovery-key based account creation/login
- JWT auth with HTTP-only cookies for REST APIs
- Direct conversation creation by `uniqueUserId`
- Realtime messaging pipeline with Socket.IO rooms
- Message persistence in PostgreSQL via Prisma

The cryptographic data models for Signal-style key material are present in the schema, while full key exchange and client-side encrypted message flow are still in progress.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Axios |
| Realtime/crypto client deps | Socket.IO client flow (gateway compatible), `@privacyresearch/libsignal-protocol-typescript` |
| Backend | NestJS 11, TypeScript, Passport JWT, Socket.IO |
| Database | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) |
| Auth | Access/refresh JWT + HTTP-only cookies + fingerprinted/hashed recovery keys |

## Repository Structure

```text
.
├── e2ee-client/
│   ├── src/app/                # Next.js app routes
│   ├── src/components/         # Login/register/contacts UI
│   └── src/lib/libsigal/       # Key generation helper (WIP integration)
└── e2ee-server/
    ├── src/modules/auth/       # Register/login/JWT strategy/token service
    ├── src/modules/conversation/
    ├── src/modules/websocket/  # Realtime events
    ├── src/database/           # Prisma service
    └── prisma/schema.prisma
```

## Architecture

```mermaid
flowchart LR
  C[Next.js Client] -->|REST /api| A[NestJS API]
  C -->|Socket.IO + access token| W[NestJS WebSocket Gateway]
  A --> P[(PostgreSQL via Prisma)]
  W --> P
```

## Quick Start

### 1) Prerequisites

- Node.js 20+
- pnpm 9+ (for server)
- npm 10+ (for client)
- PostgreSQL 15+

### 2) Clone and install

```bash
git clone <your-repo-url>
cd end2end

# server
cd e2ee-server
pnpm install

# client
cd ../e2ee-client
npm install
```

### 3) Configure environment variables

Create `e2ee-server/.env`:

```env
PORT=4000
ORIGIN_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/e2ee

JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-a-different-long-random-secret
```

Create `e2ee-client/.env.local`:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
```

### 4) Prepare database

```bash
cd e2ee-server
pnpm prisma migrate deploy
pnpm prisma generate
```

### 5) Run both apps

```bash
# terminal 1
cd e2ee-server
pnpm start:dev
```

```bash
# terminal 2
cd e2ee-client
npm run dev
```

Open `http://localhost:3000`.

## Current Product Flow

1. Open `/login` in the client.
2. Register using a display name.
3. Server generates and stores:
   - `uniqueUserId` (public user identifier)
   - one-time recovery key fingerprint + hash
4. Client can log in using recovery key.
5. Server sets `accessToken` + `refreshToken` HTTP-only cookies.
6. Authenticated users can create/get direct conversations.
7. Client connects to Socket.IO using access token in handshake auth.
8. Messages are stored and broadcast to conversation rooms.

## API Reference (Implemented)

Base URL: `http://localhost:4000/api`

### `POST /auth/register`

Creates a user using `displayName`, generates recovery key, sets cookies.

Request:

```json
{
  "displayName": "Alice"
}
```

Response (tokens omitted from JSON body; sent via cookies):

```json
{
  "id": "uuid",
  "uniqueUserId": "hex-id",
  "displayName": "Alice",
  "createdAt": "2026-03-29T00:00:00.000Z",
  "recoveryKey": "word1 word2 ... word12"
}
```

### `POST /auth/login`

Logs in using recovery key, sets access/refresh cookies.

Request:

```json
{
  "recoveryKey": "word1 word2 ... word12"
}
```

### `GET /auth/me`

Returns current user from `accessToken` cookie.

### `POST /conversation`

Requires auth cookie. Finds or creates a direct conversation with user by `uniqueUserId`.

Request:

```json
{
  "to": "<recipient-uniqueUserId>"
}
```

Response:

```json
"<conversationId>"
```

## Socket.IO Events (Implemented)

Handshake auth:

- `auth.token`: access token string (JWT access token)

Client -> Server:

- `send_message`: `{ conversationId, content }`
- `typing`: `{ conversationId }`
- `mark_read`: `{ conversationId, messageId }`

Server -> Client:

- `receive_message`: persisted message object
- `typing`: `{ userId }`
- `message_read`: `{ messageId, userId }`

## Security Notes

- Recovery keys are normalized and hashed (`bcrypt`) before storage.
- Access and refresh tokens are HTTP-only cookies in REST flow.
- `secure` cookie flag is currently `false` for local development; set to `true` behind HTTPS in production.
- Message content is currently stored as `ciphertext`, but full client-side encryption/session key exchange is not wired end-to-end yet.

## Development Commands

Server (`e2ee-server`):

```bash
pnpm start:dev
pnpm build
pnpm test
pnpm test:e2e
pnpm lint
```

Client (`e2ee-client`):

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Roadmap

- Enable full Signal-style key registration endpoints (identity/signed pre-key/one-time pre-keys)
- Encrypt message payloads client-side before `send_message`
- Implement refresh-token rotation + revocation checks
- Add conversation/message history APIs
- Replace placeholder contacts UI with real user search + chat thread rendering
- Add production hardening (rate limits, secure cookies, CSRF strategy, observability)

## License

The server package is currently marked `UNLICENSED`. Add a project license before public distribution.
