# End2End

End2End is a privacy-focused direct messaging application built with a Next.js client and a NestJS backend. It supports recovery-key authentication, cookie-based JWT sessions, realtime Socket.IO messaging, local IndexedDB chat caching, and client-side message encryption using libsodium-derived shared sessions.

The repository is organized as two applications:

- `e2ee-client`: Next.js App Router frontend for authentication, contacts, chat, local message cache, and encryption/decryption.
- `e2ee-server`: NestJS API, Socket.IO gateway, Prisma data layer, and PostgreSQL persistence.

## Current Capabilities

- Register and login with a generated recovery key.
- Store access and refresh tokens in secure `HttpOnly` cookies.
- Refresh access tokens through `/api/auth/refresh`.
- Generate client identity keys and upload public keys to the server.
- Start or reuse a direct conversation by a recipient `uniqueUserId`.
- Load conversations and paginated message history.
- Sync messages after a known cursor.
- Send encrypted messages over Socket.IO with optimistic UI updates.
- Cache conversations, messages, identity keys, and session keys in IndexedDB.
- Track active conversation read state and unread counts in the client store.
- Expose Swagger documentation at `/doc` on the backend.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Client state/cache | Zustand, IndexedDB via `idb` |
| Client crypto | `libsodium-wrappers` |
| Realtime | Socket.IO |
| Backend | NestJS 11, Passport JWT, TypeScript |
| Database | PostgreSQL, Prisma 7 |
| API docs | Swagger |

## Repository Structure

```text
.
├── docs/
│   └── diagrams/                    # architecture, data-flow, and schema diagrams
├── e2ee-client/
│   ├── src/app/                     # Next.js routes and layouts
│   │   ├── (chat)/                  # authenticated chat shell
│   │   └── login/                   # login/register flow
│   ├── src/components/              # chat, auth, contacts, and profile UI
│   ├── src/config/axios.ts          # API client and refresh-token retry logic
│   ├── src/hooks/                   # auth, socket, sodium, and message hooks
│   ├── src/lib/chat/                # message normalization/decryption helpers
│   ├── src/lib/idb/                 # IndexedDB persistence
│   ├── src/lib/libsodium/           # key generation, session derivation, encryption
│   ├── src/lib/socket/              # Socket.IO singleton and connect helpers
│   ├── src/provider/                # sodium initialization provider
│   ├── src/store/                   # Zustand auth and chat stores
│   └── src/types/                   # shared client-side response/message types
└── e2ee-server/
    ├── prisma/
    │   ├── migrations/              # database migrations
    │   ├── generated/               # generated Prisma client output
    │   └── schema.prisma            # users, conversations, messages, keys, tokens
    ├── src/database/                # Prisma module/service
    ├── src/modules/auth/            # register, login, refresh, JWT guard/strategy
    ├── src/modules/conversation/    # conversations, pagination, sync, read state
    ├── src/modules/keys/            # public identity key upload/retrieval
    ├── src/modules/websocket/       # Socket.IO gateway and message events
    └── src/utils/                   # recovery-key and user-id utilities
```

## Runtime Architecture

```mermaid
flowchart LR
  C[Next.js Client] -->|HTTPS REST + cookies| A[NestJS API]
  C -->|Socket.IO websocket + cookies| W[NestJS Gateway]
  A --> P[(PostgreSQL)]
  W --> P
  C --> I[(IndexedDB)]
```

In development, the backend starts with HTTPS certificates from `e2ee-server/`, and the client should also be served over HTTPS so `Secure` cookies can be sent cross-origin.

## Prerequisites

- Node.js 20+
- pnpm for the backend
- npm or pnpm for the frontend
- PostgreSQL 15+
- `mkcert` or equivalent local TLS certificates for development HTTPS

## Setup

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd end2end

cd e2ee-server
pnpm install

cd ../e2ee-client
npm install
```

Create `e2ee-server/.env`:

```env
PORT=4000
NODE_ENV=dev
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/e2ee
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-a-different-long-random-secret
CORS_ORIGINS=https://localhost:3000
DOMAIN=
```

Create `e2ee-client/.env.local`:

```env
NEXT_PUBLIC_SERVER_URL=https://localhost:4000
```

Generate local development certificates if they are not already present:

```bash
cd e2ee-server
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

The backend expects these files in `e2ee-server/` when `NODE_ENV` is not `production`:

- `localhost+2-key.pem`
- `localhost+2.pem`

Prepare the database:

```bash
cd e2ee-server
pnpm prisma generate
pnpm prisma migrate deploy
```

Run the backend:

```bash
cd e2ee-server
pnpm start:dev
```

Run the frontend in another terminal:

```bash
cd e2ee-client
npm run https
```

Open `https://localhost:3000`.

## Application Flow

1. The user registers with a display name or logs in with a recovery key.
2. The server validates credentials and sets `accessToken` and `refreshToken` cookies.
3. The client initializes auth through `GET /api/auth/me`.
4. The sodium provider ensures local identity keys exist and uploads the public key.
5. The chat layout loads cached conversations, then refreshes them from the API.
6. The socket connects with cookie credentials and joins the user's conversation rooms.
7. A user starts a direct chat by entering another user's `uniqueUserId`.
8. Messages are encrypted on the client, sent through `message:new`, stored as ciphertext on the server, acknowledged, and then reconciled with optimistic local messages.
9. Message history is loaded from IndexedDB first, then synced from the server by cursor.

## API Reference

Backend base URL in development: `https://localhost:4000/api`

### Auth

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a user and return the one-time recovery key. |
| `POST` | `/auth/login` | Login with a recovery key. |
| `GET` | `/auth/me` | Return the authenticated JWT user payload. |
| `POST` | `/auth/refresh` | Rotate and set fresh auth cookies from the refresh token. |

Example register body:

```json
{
  "displayName": "Alice"
}
```

Example login body:

```json
{
  "recoveryKey": "word1 word2 word3 ..."
}
```

### Conversations and Messages

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/conversation` | List conversations for the authenticated user. |
| `POST` | `/conversation/getid` | Find or create a direct conversation by recipient `uniqueUserId`. |
| `GET` | `/conversation/loadchats?conversationId=<id>` | Legacy full conversation message load. |
| `GET` | `/conversation/sync?conversationId=<id>&after=<messageId>` | Legacy message sync endpoint. |
| `PATCH` | `/conversation/read` | Mark a conversation read through the REST API. |
| `GET` | `/messages/:conversationId` | Paginate messages, optionally with `before` and `limit`. |
| `GET` | `/messages/:conversationId/sync` | Sync messages after a cursor, optionally with `after` and `limit`. |

Example find/create conversation body:

```json
{
  "to": "recipient-unique-user-id"
}
```

Example mark-read body:

```json
{
  "conversationId": "conversation-id",
  "messageId": "optional-message-id"
}
```

### Keys

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/keys/upload` | Store the authenticated user's public identity key. |
| `GET` | `/keys/:receiverId` | Fetch a recipient public key by `uniqueUserId`. |

Example key upload body:

```json
{
  "publicKey": "base64-public-key"
}
```

## Socket.IO Events

The gateway authenticates connections from the `accessToken` cookie. The client connects to `NEXT_PUBLIC_SERVER_URL` with `withCredentials: true` and websocket transport.

### Client to Server

| Event | Payload | Description |
| --- | --- | --- |
| `conversation:join` | `"conversationId"` | Join a conversation room after opening a chat. |
| `conversation:leave` | `"conversationId"` | Leave a conversation room. |
| `message:new` | `{ conversationId, cipherText, nonce, clientTempId }` | Persist and broadcast an encrypted message. |
| `message:sync` | `{ conversationId, after?, limit? }` | Fetch messages after a cursor over the socket. |
| `conversation:read` | `{ conversationId, messageId? }` | Update the sender's read marker. |
| `typing` | `{ conversationId }` | Broadcast typing state. |
| `mark_read` | `{ conversationId, messageId }` | Legacy read-status event. |

Legacy aliases are still available for older clients:

- `join:conversation`
- `leave:conversation`
- `send_message`

### Server to Client

| Event | Payload | Description |
| --- | --- | --- |
| `message:new` | persisted message payload | Broadcast new encrypted messages to the conversation room. |
| `conversation:update` | conversation summary fields | Broadcast last-message metadata updates. |
| `message:ack` | `{ status, messageId, createdAt, clientTempId }` | Reconcile sender optimistic messages. |
| `receive_message` | persisted message payload | Legacy incoming-message event. |
| `typing` | `{ userId }` | Typing notification. |
| `message_read` | `{ messageId, userId }` | Legacy read-status notification. |

## Data Model

The Prisma schema models:

- `User`: display name, generated unique user ID, recovery-key fingerprint/hash, identity key, refresh tokens.
- `UserIdentityKey`: long-term public key used by clients to derive direct-session keys.
- `Conversation`: direct conversations keyed by sorted participant pair, plus last-message metadata.
- `ConversationMember`: user membership, read cursor, and read timestamp.
- `Message`: UUIDv7 message ID, sender `uniqueUserId`, ciphertext, nonce, type, status, and timestamps.
- `RefreshToken`: persisted refresh token hashes for multi-device sessions.

## Development Commands

Backend:

```bash
cd e2ee-server
pnpm start:dev
pnpm build
pnpm test
pnpm test:e2e
pnpm lint
pnpm format
```

Frontend:

```bash
cd e2ee-client
npm run dev
npm run https
npm run build
npm run start
npm run lint
```

## Security Notes

- Recovery keys are fingerprinted and hashed before storage.
- Auth tokens are delivered in `HttpOnly`, `Secure`, `SameSite=None` cookies.
- Refresh tokens are stored server-side as hashes.
- Message plaintext is not stored by the server in the current client flow; messages are sent and persisted as ciphertext plus nonce.
- Direct-session keys are derived client-side with libsodium and stored in IndexedDB.
- The current encryption model uses public identity keys and derived direct-session keys. It is not a full Signal double-ratchet implementation.
- Development requires HTTPS because secure cookies are enabled.

## Known Gaps

- Logout and refresh-token revocation endpoints are not currently exposed.
- Typing indicators and some legacy socket events exist server-side but are not fully surfaced in the UI.
- Key rotation, multi-device key bundles, and full forward-secret ratcheting are not implemented.
- Some generated/build artifacts are present in the working tree and should be excluded from source control in production projects.
