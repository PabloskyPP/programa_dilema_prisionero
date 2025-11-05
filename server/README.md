# 🧠 Game Server (Node.js + Drizzle + PostgreSQL)

This is the backend for the multiplayer game app where the subject play several rounds of individual prisioner dylemn. It handles WebSocket communication, game logic, and PostgreSQL data using Drizzle ORM.

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Create a `.env` file in the root of the server directory and add your PostgreSQL connection URL:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
```

Replace `username`, `password`, `localhost`, `5432`, and `dbname` with your actual PostgreSQL credentials.

---

### 3. Set up database schema

```bash
npx drizzle-kit push
```

To generate SQL migrations:

```bash
npx drizzle-kit generate
```

---

## ▶️ Running the Server

```bash
npm run dev
```

---

## 🌐 Make Public with Cloudflare Tunnel

To expose your server locally via a public URL:

```bash
cloudflared tunnel --url http://localhost:3001
```

> Replace `3001` with your server port if different.

---

## 🧪 Drizzle Config Reference

```ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## ✅ Requirements

- Node.js ≥ 18
- PostgreSQL running locally or remotely
- Drizzle ORM
- WebSocket-compatible client (Next.js or frontend of your choice)
- `cloudflared` CLI installed (for public tunneling)
