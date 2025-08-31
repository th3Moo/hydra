# Hydra Casino

Modern online gaming platform with a Node/Express + SQLite backend and React frontend.

## Monorepo Layout
```
hydra-casino/
├─ backend/        # Express API + SQLite
└─ frontend/       # React app
```

## Quick Start

### 1) Clone
```bash
git clone https://github.com/<you>/hydra-casino.git
cd hydra-casino
```

### 2) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev   # or: npm start
```

### 3) Frontend
```bash
cd ../frontend
npm install
npm start
```

### Environment
Copy `.env.example` to `.env` in `backend/` and set a strong `JWT_SECRET`.

### Deployment (Sevalla)
- Run backend with PM2 (port 3001 by default)
- Serve frontend build via Nginx (proxy /api → backend)
- Use the provided GitHub Actions to build and (optionally) deploy over SSH

## GitHub Actions
- **CI**: Builds backend and frontend on every push/PR
- **Deploy (optional)**: If you add repository secrets `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `SSH_PORT` (optional), it will SSH into your Sevalla box and run a deploy script (`deploy.sh` snippet in the workflow).

## Notes
- Webhooks verification for CashApp/TRON are placeholders; wire in real signature/chain verification for production.
- SQLite is bundled for simplicity; you can later migrate to Postgres using `DATABASE_URL` if needed.
