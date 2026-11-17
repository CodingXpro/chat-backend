# Chat Backend

Node.js + strict TypeScript + PostgreSQL (Prisma 7) + Firebase Firestore.

## Setup
1. `npm install`
2. Create PostgreSQL database: `CREATE DATABASE chat_db;`
3. Copy `.env.example` to `.env` and fill PostgreSQL URL and Firebase service-account variables. Enable Cloud Firestore in your Firebase project. Never commit `.env` or service-account JSON.
4. `npx prisma migrate dev --name init`
5. `npx prisma generate`
6. `npm run dev`

## Seed two users manually
Use Prisma Studio (`npx prisma studio`) to insert two users with valid UUIDs, names and distinct emails, or insert them using SQL. The assignment does not request user registration.

## API examples
`POST /chat/create` body `{"userAId":"<uuid>","userBId":"<uuid>"}`
`POST /chat/:chatId/message/send` body `{"senderId":"<uuid>","text":"Hello"}`
`GET /chat/:chatId/messages?limit=50`
`POST /chat/:chatId/message/:messageId/read` body `{"userId":"<uuid>"}`
`POST /chat/:chatId/lastseen` body `{"userId":"<uuid>","messageId":"<message-id>"}`
`GET /user/:userId/chats`

## Notes
- No automated tests included, per request.
- IDs in request bodies are trusted for this assignment. Add authentication and derive acting user IDs from verified tokens before production use.
- `GET messages` returns the newest N messages in chronological order. Pagination is not implemented.
- Firestore read receipts and last-seen state are stored separately.
- The database and Firestore are separate systems; cross-database transactions are not available.
