# VeriVote

An online voting platform built with React, TypeScript, and Firebase. Supports multi-position elections with live results and English, Hindi, and Tamil translations.

**Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Firebase Firestore

---

## Setup

You need Node.js 18+ and a Firebase project with Firestore enabled.

```bash
npm install
cp .env.example .env.local
```

Open `.env.local` and fill in your Firebase credentials (find them in Firebase Console under Project Settings):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_DATABASE_ID=
```

Then run:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## Demo accounts

Login uses mock auth — no real Firebase Authentication needed.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@a.com` | `q` |
| Voter | `voter1@v.com` | `q` |
| Voter | `voter2@v.com` | `q` |

Admin can create elections, start/end them, and see vote counts. Voters can only cast ballots.

---

## What it does

- Multi-position ballots (voter steps through each position one at a time)
- Live vote tallies via Firestore `onSnapshot`
- Duplicate vote prevention using a deterministic document ID per voter+election
- English, Hindi, and Tamil UI, switchable without a page reload
- Dark and light mode

---

## Notes

This is a prototype. A few things are intentionally simplified:

- Auth is localStorage-based, not real Firebase Auth
- Firestore rules allow all reads/writes (fine for a demo, not for production)
- Vote tallies increment client-side rather than using `FieldValue.increment()`

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm run lint` | TypeScript type check |

---

MIT
