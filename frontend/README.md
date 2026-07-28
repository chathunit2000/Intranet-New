# Intranet Frontend (React + Vite)

## Setup

```bash
npm install
copy .env.example .env   # point VITE_API_URL at your Node.js backend
npm run dev
```

Opens at `http://localhost:5173`. Make sure the Node backend is running
at the URL in `.env` (default `http://localhost:8000/api`) and that CORS
is configured to allow this origin.

## How it's wired

- `src/services/api.js` — axios instance, attaches the bearer-token
  from `localStorage` to every request, and bounces to login on 401.
- `src/pages/Login.jsx` — posts `service_no` + `password` to `/login`,
  stores the returned token.
- `src/pages/Dashboard.jsx` — on mount, calls `GET /dashboard` once and
  renders all five sections (profile, attendance, updates, quick links,
  document panels) from that single payload.
- `src/index.css` — the dark navy / orange theme, using CSS variables so
  colors are easy to retune from one place.

## Login for the seeded demo employee

- Service No: `6609`
- Password: `6609`

## Next steps to flesh out

1. **Icons** — swap the placeholder `•` in quick links / the emoji
   avatars for a real icon set (e.g. `lucide-react`) mapped from each
   record's `icon` string.
2. **Routing** — add `react-router-dom` once you have more than the
   dashboard + login (e.g. a real Leave Management page, e-Directory
   search, Attendance report table).
3. **Avatar upload** — the profile card's camera icon in the design
   implies photo upload; wire a `POST /api/profile/avatar` endpoint and
   a file input.
4. **Real-time attendance** — if check-in/out happens via a biometric
   device feeding the DB directly, consider polling `/dashboard` every
   minute or adding a websocket/Pusher broadcast instead.
