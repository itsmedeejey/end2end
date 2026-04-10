# End2End

Privacy-first chat app with a Next.js client and a NestJS backend. The project is structured for Signal-style E2EE, but the current runtime flow is auth + conversation + realtime message delivery with ciphertext stored as plain text content.

## Overview

This repository contains:

- `e2ee-client`: Next.js (App Router) frontend
- `e2ee-server`: NestJS API + Socket.IO gateway + Prisma/PostgreSQL

What is implemented today:

- Recovery-key based register/login
- Access + refresh JWT cookies (`HttpOnly`, `Secure`, `SameSite=None`)
- Authenticated conversation listing and message history loading
- Direct-conversation create/find API by `uniqueUserId`
- Socket.IO messaging with room join on connect
- Optimistic message UI + ack reconciliation on sender side
- Polling fallback when socket is disconnected

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Axios, Zustand |
| Backend | NestJS 11, Passport JWT, Socket.IO, TypeScript |
| Database | PostgreSQL + Prisma 7 |
| Crypto deps (WIP wiring) | `@privacyresearch/libsignal-protocol-typescript` |

## Repository Structure

```text
.
├── e2ee-client/
│   ├── src/app/                # routes
│   ├── src/components/         # login/register/chat UI
│   ├── src/hooks/              # auth/socket/message hooks
│   └── src/store/              # auth/chat state (zustand)
└── e2ee-server/
    ├── src/modules/auth/       # register/login/me + JWT strategy/token service
    ├── src/modules/conversation/ # list chats, load messages, find/create conversation
    ├── src/modules/websocket/  # realtime gateway events
    ├── src/database/           # Prisma service
    └── prisma/schema.prisma
```

## Runtime Architecture

```mermaid
flowchart LR
  C[Next.js Client] -->|REST /api/* + cookies| A[NestJS API]
  C -->|Socket.IO + cookie auth| W[NestJS WebSocket Gateway]
  A --> P[(PostgreSQL via Prisma)]
  W --> P
```

## Quick Start

### 1) Prerequisites

- Node.js 20+
- pnpm 9+ (server)
- npm 10+ (client)
- PostgreSQL 15+

### 2) Install dependencies

```bash
git clone <your-repo-url>
cd end2end

cd e2ee-server
pnpm install

cd ../e2ee-client
npm install
```

### 3) Configure environment variables

Create `e2ee-server/.env`:

```env
PORT=4000
NODE_ENV=dev

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/e2ee

JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-a-different-long-random-secret

# comma separated origins
CORS_ORIGINS=https://localhost:3000

# optional (set in production when needed)
DOMAIN=
```

Create `e2ee-client/.env.local`:

```env
NEXT_PUBLIC_SERVER_URL=https://localhost:4000
```

### 4) Dev TLS certificates (required by current server boot flow)

When `NODE_ENV !== production`, server starts in HTTPS mode and expects these files in `e2ee-server/`:

- `localhost+2-key.pem`
- `localhost+2.pem`

If missing, generate them (example using `mkcert`):

```bash
cd e2ee-server
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

### 5) Prepare database

```bash
cd e2ee-server
pnpm prisma migrate deploy
pnpm prisma generate
```

### 6) Run both apps

```bash
# terminal 1
cd e2ee-server
pnpm start:dev
```

```bash
# terminal 2
cd e2ee-client
npm run https
```

Open `https://localhost:3000`.

## Current Application Flow

1. User opens `/login`.
2. User chooses:
   - register: submit `displayName` to `POST /api/auth/register`
   - login: submit `recoveryKey` to `POST /api/auth/login`
3. Server sets `accessToken` + `refreshToken` cookies and returns user payload (`register` also returns one-time `recoveryKey`).
4. Client redirects to `/`.
5. Route protection in `src/proxy.ts`:
   - unauthenticated users are redirected from `/` and `/chat/*` to `/login`
   - authenticated users are redirected from `/login` to `/`
6. Chat layout initializes auth by calling `GET /api/auth/me` (`useInitAuth`), then sets Zustand auth state.
7. On authenticated state:
   - client loads conversations via `GET /api/conversation`
   - socket connection is opened (`withCredentials: true`)
8. On `/chat/:id`, client loads history with `GET /api/conversation/loadchats?conversationId=...`.
9. Sending a message:
   - client appends optimistic message with `status="sending"`
   - emits `send_message` with `{ conversationId, content, clientTempId }`
   - server validates membership, persists message, returns ack
   - sender reconciles optimistic message from ack
   - other room members receive `receive_message`
10. If socket disconnects, client polls message history every 4 seconds for the active conversation.

Current UI limitation:

- "start a new chat" button is present but not wired yet.
- `typing` and `mark_read` socket events exist server-side but are not emitted by current UI.

## API Reference (Implemented)

Base URL: `https://localhost:4000/api`

### Auth

- `POST /auth/register` body: `{ "displayName": "Alice" }`
- `POST /auth/login` body: `{ "recoveryKey": "word1 word2 ... word12" }`
- `GET /auth/me` (requires `accessToken` cookie)

### Conversation

- `GET /conversation` (requires auth cookie) -> conversation list with participant metadata
- `GET /conversation/loadchats?conversationId=<id>` (requires auth cookie) -> ordered messages
- `POST /conversation/getid` body: `{ "to": "<recipientUniqueUserId>" }` (requires auth cookie) -> find/create direct conversation

## Socket.IO Events (Implemented)

Handshake auth: `accessToken` is read from cookies during websocket connection.

Client -> Server:

- `send_message`: `{ conversationId, content, clientTempId }`
- `typing`: `{ conversationId }`
- `mark_read`: `{ conversationId, messageId }`

Server -> Client:

- `receive_message`: persisted message payload for room members (excluding sender socket)
- `typing`: `{ userId }`
- `message_read`: `{ messageId, userId }`

Ack from `send_message`:

```json
{
  "status": "ok",
  "messageId": "uuid",
  "createdAt": "2026-04-10T00:00:00.000Z",
  "clientTempId": "local-..."
}
```

## Security Notes

- Recovery keys are fingerprinted + hashed before storage.
- Tokens are cookie-based and marked `HttpOnly`, `Secure`, `SameSite=None`.
- Refresh tokens are persisted in DB; refresh rotation/logout endpoints are not yet implemented.
- Message `ciphertext` is currently storing raw message content; full client-side encryption/session exchange is still pending.

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
npm run https
npm run build
npm run start
npm run lint
```
