# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — runs the Vite dev server (`:5173`) and the Express API (`:3001`, via `node --watch`) concurrently. Vite proxies `/api/*` to `:3001` (see `vite.config.js`).
- `npm run build` — Vite production build to `dist/`.
- `npm start` — runs the Express server only (`server/index.js`), serving the built `dist/` if present. This is the production entrypoint (single process).
- `npm run db:setup` — runs `server/db/seed.js`: applies `server/db/schema.sql` then upserts `server/db/seedData.js` into the `products` table. Safe to re-run.
- `npm run lint` — oxlint (config in `.oxlintrc.json`).
- `npm run preview` — preview the Vite production build.

No test suite is configured in this repo.

### Environment setup

Copy `.env.example` to `.env` and set:
- `DATABASE_URL` — Postgres (Neon) connection string. Required; `server/db.js` throws on startup if missing.
- `BETTER_AUTH_SECRET` — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Required; `server/auth.js` throws on startup if missing.
- `BETTER_AUTH_URL`, `PORT`, `CLIENT_ORIGIN` — see comments in `.env.example`.

## Architecture

This is a single-page e-commerce app: a Vite/React frontend (`src/`) backed by an Express API (`server/`) and Postgres, with Better Auth for session-based email/password authentication.

### Two-server dev, one-process prod

In dev, Vite (`:5173`) and Express (`:3001`) run as separate processes; Vite proxies `/api` requests to Express. In production, `npm run build` emits static assets to `dist/`, and `server/index.js` serves them directly (`express.static` + SPA fallback to `index.html` for non-API GET requests) — there is only one deployable process. Keep this in mind when changing routing or static-file logic: it must work both proxied (dev) and same-origin (prod).

### Auth (Better Auth)

- `server/auth.js` configures `betterAuth` against the same `pg.Pool` used elsewhere (`server/db.js`), storing its own tables (`user`, `session`, etc.) directly in Postgres — there is no separate auth service.
- `server/index.js` mounts Better Auth's handler at `/api/auth` via `toNodeHandler(auth)` **before** `express.json()`, because Better Auth needs the raw request body. Any new body-parsing middleware must stay after this mount.
- `server/middleware/requireAuth.js` is applied per-router (see `orders.js`: `router.use(requireAuth)`) rather than globally — it resolves the session via `auth.api.getSession` and attaches `req.user`.
- On the client, `src/lib/authClient.js` wraps `better-auth/react` (`useSession`, `signIn`, `signUp`, `signOut`). `src/components/RequireAuth.jsx` is a route guard that redirects unauthenticated users to `/login?redirect=<path>` (see `/checkout` and `/orders` routes in `src/App.jsx`).

### Data model & API

Three Postgres tables (`server/db/schema.sql`): `products`, `orders` (FK to Better Auth's `user` table, `ON DELETE CASCADE`), and `order_items` (FK to `orders`, `ON DELETE CASCADE`). Order line items snapshot product fields (`name`, `price`, `emoji`, `color`, `image`) at purchase time rather than joining live to `products`, so historical orders stay accurate if a product changes later.

- `GET/POST /api/products` (`server/routes/products.js`) — public, read-only.
- `GET/POST /api/orders` (`server/routes/orders.js`) — requires auth. `POST` runs inside a transaction: locks each product row (`FOR UPDATE`), validates stock, decrements it, and inserts the order + snapshot line items — all in one place, since stock changes and order creation must stay atomic.

### Frontend state

No global state library — two React Context providers wrap the app in `src/App.jsx`:
- `CartContext` (`src/context/CartContext.jsx`) — persisted to `localStorage` via the generic `useLocalStorage` hook (`src/hooks/useLocalStorage.js`); clamps quantities to each item's `stock`.
- `OrdersContext` (`src/context/OrdersContext.jsx`) — in-memory, fetched from the API on demand via `refresh()`.

`src/lib/api.js` is a thin `fetch` wrapper (`api.getProducts`, `api.getProduct`, `api.getOrders`, `api.placeOrder`) that prefixes `/api` and throws on non-OK responses using the server's `{ error }` JSON body.

Routing is `react-router-dom` (`src/App.jsx`), pages under `src/pages/`, shared UI under `src/components/`.
