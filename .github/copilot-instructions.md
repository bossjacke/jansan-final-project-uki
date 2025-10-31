# Copilot / AI Agent Instructions — jansan-final-project-uki

This file contains concise, actionable guidance to help AI coding agents be productive in this repository.

Summary
- Backend: Node.js (ESM) + Express (v5) + Mongoose. Entry: `backend/src/server.js` -> `backend/src/app.js`.
- Frontend: React + Vite. Entry: `frontend/src/main.jsx`. API helper: `frontend/src/api.js`.

Quick start (dev)
- Backend:
  - cd backend
  - npm install
  - npm run dev   # runs `nodemon src/server.js` (see `backend/package.json`)
- Frontend:
  - cd frontend
  - npm install
  - npm run dev   # starts Vite on 5173

Environment & runtime notes
- Backend uses `type: "module"` (ESM). Use `import`/`export` consistently.
- Important env variables:
  - `MONGO_URI` — MongoDB connection string (used in `backend/src/config/db.js`).
  - `JWT_SECRET` — used by `backend/src/middleware/auth.js` and controllers for signing tokens.
  - `PORT` — server listen port (default: 3003 in `server.js`).

Architecture & common patterns
- Controllers live in `backend/src/controllers/*` and return JSON responses (e.g. `user.controller.js`).
- Routes are organized in `backend/src/routes/*` and mounted in `app.js`.
- Auth flow: `authMiddleware` (reads Bearer token header, attaches `req.user = {id, role}`) — check `backend/src/middleware/auth.js`.
- Data: Mongoose models in `backend/src/models/*`. Controllers use `Model.find`/`create`/`findByIdAndUpdate` patterns.

Project-specific conventions / gotchas
- API base URLs:
  - Backend server defaults to port 3003. Frontend dev server runs on 5173.
  - Check `frontend/src/api.js`: it currently sets `API_URL = "http://localhost:5173/api"` (this is likely incorrect for talking to the backend). The commented-out value `http://localhost:3003/api` is what the frontend should use when calling the backend dev server.
- Route mounting quirk: `backend/src/app.js` mounts products route as `app.use("api/products", router);` — missing a leading slash. It should be `app.use("/api/products", router);`.
- `backend/src/utils/helpers.js` is currently empty — useful place for shared helpers.
- Error handling: controllers send JSON with `{ message, error }` consistently — follow that shape when adding new endpoints.

Integration points & external deps
- Stripe: `stripe` dependency present in backend `package.json` — payments handled in `backend/src/controllers/payment.controller.js`.
- PDF generation: `pdfkit` is used in `backend/src/utils/invoiceGenerator.js`.

Editing / tests / quality
- There are no tests configured. For quick validation:
  - Run backend dev and exercise endpoints with Postman or curl.
  - Run frontend dev and verify login/register flows against the backend.
- Linting: frontend has an `npm run lint` script using ESLint (`frontend/package.json`).

Examples to show patterns
- Authenticated request: include header `Authorization: Bearer <token>`; `authMiddleware` decodes token and sets `req.user`.
- Controller response shape (user register/login): `{ message: string, token?: string, user?: { id, name, email, role } }`.

When merging or changing files
- Preserve ESM imports and avoid CommonJS `require`/`module.exports`.
- Respect existing JSON response shapes when modifying controllers to avoid frontend breakage.

If you are unsure
- Look at `backend/src/app.js`, `backend/src/server.js`, `frontend/src/api.js`, and `backend/src/controllers/user.controller.js` for canonical examples.
- Ask for missing env values (MONGO_URI, JWT_SECRET) — do not fabricate secrets.

Feedback
Please review any unclear sections or add project conventions that are not discoverable from the codebase.
