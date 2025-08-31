# Hydra Project (No MongoDB)

This version does **not** use MongoDB.  
All data is stored **in-memory** (resets on restart).

## 🚀 Frontend
- `frontend/index.html`
- `frontend/register.html`
- Auto-deployed to GitHub Pages via `.github/workflows/pipeline.yml`

## ⚙️ Backend
- Folder: `backend_nomongo/`
- Server: Node.js + Express
- No database required

### Setup Backend
1. SSH into your Sevalla server
2. Install dependencies:
   ```bash
   cd backend_nomongo
   npm install
   ```
3. Start server:
   ```bash
   node server.js
   ```

Backend runs on:
```
http://your-sevalla-domain:5000
```

Or with Docker:
```bash
docker-compose up -d
```

## 🔗 Connecting
Update `API_BASE` in frontend files:
```js
const API_BASE = "https://your-sevalla-domain.com:5000";
```

Routes supported:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/wallets`
- `POST /api/tx/deposit`
- `POST /api/tx/withdraw`
- `POST /api/tx/exchange`
- `GET /api/settings`

---
⚡ Data resets when backend restarts (since no DB). For persistence, you can later add MongoDB.
