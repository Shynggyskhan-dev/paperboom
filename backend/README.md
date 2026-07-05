# PaperBoom — Backend

Node.js + sql.js (SQLite, pure JS — no native build required).

## Quick start

```bash
cd backend
npm install        # install dependencies
npm run setup      # create tables + seed products (safe to re-run)
npm run dev        # start Express server (Step 2)
```

## Scripts

| Script          | What it does                                     |
|-----------------|--------------------------------------------------|
| `npm run init-db` | Creates all tables in `db/paperboom.db`        |
| `npm run seed`    | Inserts 24 products (INSERT OR IGNORE — safe)  |
| `npm run setup`   | Runs init-db then seed in sequence             |
| `npm start`       | Starts Express API server (after Step 2)       |

## Database — `db/paperboom.db`

| Table         | Purpose                                         |
|---------------|-------------------------------------------------|
| `users`       | Registered buyers (phone = login)               |
| `products`    | Full catalogue — article, name, price, volume   |
| `orders`      | Order header — user, total, status, timestamp   |
| `order_items` | Line items — product + qty + price at purchase  |
| `favorites`   | User ↔ product many-to-many                     |

## Tech stack

- **sql.js** — pure-JS SQLite (no `node-gyp` / native build needed)
- **bcryptjs** — password hashing
- **Express** (Step 2) — REST API
