# VeriVote — Secure Online Voting Platform

A real-time, multilingual online voting platform built with React, TypeScript, and Firebase Firestore. Supports multi-position elections, role-based access control, and live vote tallies across English, Hindi, and Tamil.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Frontend | React 19 (TSX) |
| Database | Firebase Firestore (real-time NoSQL) |
| Styling | Tailwind CSS v4 |
| Animations | Motion/React (Framer Motion) |
| Icons | Lucide React |
| Build Tool | Vite |
| i18n | Custom JSON + React Context |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Firebase project with Firestore enabled

### 1. Clone the repository

```bash
git clone https://github.com/your-username/verivote.git
cd verivote
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your Firebase project values:

```bash
cp .env.example .env.local
```

Then open `.env.local` and add your credentials:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_DATABASE_ID=your_firestore_database_id
```

Find these values in your Firebase Console under **Project Settings → General → Your apps**.

> `.env.local` is listed in `.gitignore` and will never be committed to the repository.

### 4. Set up Firestore

In the Firebase Console, create a Firestore database and deploy the included security rules:

```bash
firebase deploy --only firestore:rules
```

Or paste the contents of `firestore.rules` manually in the Firebase Console under **Firestore → Rules**.

### 5. Run locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Demo Accounts

The project ships with a mock authentication system for development. No real Firebase Authentication is required to run the demo.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@a.com` | `q` |
| Voter | `voter1@v.com` | `q` |
| Voter | `voter2@v.com` | `q` |

> **Note:** The admin account unlocks election creation, lifecycle management (start/end/reopen), and vote count visibility on each card.

---

## Features

- **Multi-position elections** — a single ballot steps the voter through every position in sequence
- **Live results** — vote tallies update in real time across all connected clients via Firestore `onSnapshot`
- **Role-based access** — admins manage elections; voters cast ballots; neither can access the other's controls
- **Multilingual UI** — full English, Hindi, and Tamil support, switchable at runtime without a page reload
- **Duplicate vote prevention** — each vote receipt uses a deterministic Firestore document ID (`voterUID_electionID`)
- **Platform analytics** — results page shows election counts, vote totals, distribution charts, and a per-election detail modal
- **Dark / light mode** — persisted to localStorage, toggled via the navbar button

---

## Project Structure

```
src/
├── components/
│   ├── AuthPage.tsx          # Login / register form
│   ├── Dashboard.tsx         # Election cards, vote modal, results modal
│   ├── LandingPage.tsx       # Public hero page
│   ├── Layout.tsx            # Nav, footer, theme toggle, language switcher
│   ├── ResultsPage.tsx       # Platform analytics and per-election results
│   └── SecurityPage.tsx      # Security and trust information page
├── i18n/
│   ├── en.json               # English translations
│   ├── hi.json               # Hindi translations
│   └── ta.json               # Tamil translations
├── App.tsx                   # Root component, routing state, error boundary
├── AuthContext.tsx            # Auth state, language state, translation helper
├── firebase.ts               # Firebase initialisation (reads from env vars)
├── main.tsx                  # React entry point
├── index.css                 # Tailwind + CSS custom properties (theme tokens)
└── types.ts                  # Shared TypeScript interfaces
```

---

## Known Limitations

This is a functional prototype. The following gaps exist in the current implementation and are planned for the production version:

| Limitation | Production Fix |
|---|---|
| Mock authentication (localStorage) | Firebase Authentication with verified email/password |
| Open Firestore security rules | Per-user `request.auth.uid` ownership rules |
| Client-side tally increment | `FieldValue.increment()` server-side atomic operation |
| Non-atomic dual write on vote submission | Firestore Transaction wrapping both writes |
| Vote logic runs in the browser | Firebase Cloud Function for server-side vote validation |

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_APP_ID` | Firebase app identifier |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging sender ID |
| `VITE_FIREBASE_DATABASE_ID` | Specific Firestore database ID (if not `(default)`) |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run TypeScript type checking |

---

## Licence

MIT