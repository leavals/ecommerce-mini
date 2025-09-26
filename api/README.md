# api (Express + Prisma + PayPal)

## Scripts
- `npm run dev` → start in dev (ts-node-dev)
- `npm run build && npm start` → production

## Env
Copy `.env.example` to `.env` and fill values:
```
PORT=4000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=change_me
DATABASE_URL="file:./dev.db"
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
PAYPAL_MODE=sandbox
BASE_URL=http://localhost:4000
```
