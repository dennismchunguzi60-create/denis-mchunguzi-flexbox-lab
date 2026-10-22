# Denis Mchunguzi's Flexbox Lab — Full-stack starter

Includes the existing static CSS playground plus a Node.js/Express API starter for signup, login, account details, and saving/loading/deleting project JSON in PostgreSQL.

## Important deployment note
This ZIP is **not a one-click Netlify-only deployment**. Netlify can host the static frontend, but the API must be deployed separately (for example, on Render) and connected to a PostgreSQL database. The current playground UI remains usable on its own; the included API endpoints are starter backend services and are **not yet wired into signup/project-saving buttons in the frontend**. Do not advertise account saving or subscriptions as live until that integration and testing are completed.

## Deploy frontend
1. Deploy the contents of `Denis-Mchunguzi-Flexbox-Lab/` (the folder containing `index.html`, `style.css`, and `script.js`) to Netlify.
2. Keep your previous deploy as a rollback option.

## Deploy API
1. Create a PostgreSQL database with your hosting provider.
2. Run `backend/schema.sql` against that database once.
3. Deploy the `backend` folder as a Node web service using `npm install` and `npm start`.
4. Configure environment variables from `backend/.env.example`: `DATABASE_URL`, a long random `JWT_SECRET`, `FRONTEND_ORIGIN` (your exact Netlify site origin), and optionally `PORT` (hosting providers usually set it automatically).
5. Check `https://YOUR-API-HOST/api/health`.

## API routes
- `POST /api/auth/signup` — JSON `{ "name": "Student", "email": "student@example.com", "password": "at-least-8-characters" }`
- `POST /api/auth/login` — JSON `{ "email": "student@example.com", "password": "..." }`
- `GET /api/account` — requires `Authorization: Bearer <token>`
- `GET /api/projects` — requires bearer token
- `POST /api/projects` — requires bearer token; JSON `{ "title": "Flex layout", "layout": { "gap": 24, "layout": "flex" } }`
- `DELETE /api/projects/:id` — requires bearer token

## Subscription/payment status
The schema includes `plan` and `subscription_status` fields, but **no payment provider is connected**. Do not manually grant premium access based on frontend data. Integrate a provider and verify payment webhooks server-side before selling subscriptions.

## Security notes
- Never commit `.env` or production secrets.
- Use HTTPS in production.
- JWT secret must be long and random.
- This is a learning starter; before public launch add rate limiting, email verification/password reset, stronger validation, automated tests, and payment webhook verification.
