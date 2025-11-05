# 🎮 Game Client (Next.js)

This is the frontend for the multiplayer game app built using Next.js.

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

---

### 2. Create environment file

Create a `.env` file in the root of the client directory with the following contents:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
```

- `NEXT_PUBLIC_BASE_URL`: URL of the client (usually `http://localhost:3000`)
- `NEXT_PUBLIC_SERVER_URL`: URL of the backend server (usually `http://localhost:3001`)

These variables are required for API calls and WebSocket communication.

---

### 3. Start the development server

```bash
npm run dev
```

> Visit [http://localhost:3000/admin](http://localhost:3000/admin) to access the app.

---

### 4. Build for Production

```bash
npm run build
npm start
```

---

## 🌐 Make Public with Cloudflare Tunnel

To expose your client locally via a public URL:

```bash
cloudflared tunnel --url http://localhost:3000
```

> Replace `3000` with your client port if different.

---

## 📁 Project Structure

- `app/` or `pages/` — Next.js routes and pages.
- `components/` — Reusable UI components.
- `lib/` or `utils/` — Helpers and utilities.
- `env` — Environment variables (accessed via `process.env.NEXT_PUBLIC_*`)

---

## 🛠️ Tech Stack

- React & Next.js
- TypeScript
- TailwindCSS (optional if you use it)
- WebSockets
- Environment variables for config

---

## ✅ Requirements

- Node.js ≥ 18
- A running server at `NEXT_PUBLIC_SERVER_URL`
