# PermitPro FL

Florida Manufactured Housing Permit Suite — a cross-platform desktop and mobile application for Permit Coordinators specializing in Mobile and Modular homes.

---

## What It Does

- **Flight Deck** — dashboard of all active permit packets with status, wind zone, and pre-flight scan results
- **Permit Wizard** — guided 6-step form that branches based on home type (HUD Code mobile vs. FBC modular)
- **AI Pre-Flight Scan** — Gemini 2.5 Flash analyzes uploaded documents (deeds, data plates, NOCs) and flags compliance issues
- **67-County Database** — wind zones, building department contacts, fee schedules, and jurisdiction-specific checklists for every Florida county
- **PDF Viewer** — integrated viewer with zoom, rotate, and thumbnail navigation; no printing required
- **Compliance Engine** — offline wind zone and flood zone guardrails (Zone II home in Zone III county is an immediate error)
- **Cloud Sync** — Firestore real-time sync between office desktop and field mobile; works offline with local cache

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Tailwind CSS v4 |
| Build | Vite 8 |
| Desktop | Electron 41 |
| Mobile | Capacitor |
| Backend | Firebase (Firestore + Storage + Auth) |
| State | Zustand |
| AI / OCR | Google Gemini 2.5 Flash |
| PDF | react-pdf + pdfjs-dist |
| Forms | react-hook-form + zod |
| LaTeX | KaTeX |

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd flpermitpro
npm install
```

### 2. Set up environment variables

Copy the example file:

```bash
cp .env.example .env
```

Then fill in your keys (see [API Keys](#api-keys) below).

### 3. Run

```bash
# Web browser (fastest for development)
npm run dev

# Electron desktop app
npm run dev:electron

# Run tests
npm test
```

---

## API Keys

The app requires two external services: **Google Firebase** and **Google Gemini**. Both use the same Google account.

---

### Firebase (Database, Storage, Auth)

Firebase provides the Firestore database, file storage, and user authentication.

**Step-by-step:**

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → enter a project name (e.g. `flpermitpro`) → click through the setup wizard
3. Once inside the project, click the **web icon `</>`** (Add app) on the Project Overview page
4. Register the app with a nickname (e.g. `PermitPro FL Web`) — do **not** enable Firebase Hosting
5. Firebase will show you a config block like this:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "yourproject.firebaseapp.com",
  projectId: "yourproject",
  storageBucket: "yourproject.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. Copy each value into your `.env` file:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=yourproject.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yourproject
VITE_FIREBASE_STORAGE_BUCKET=yourproject.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Enable Firestore:**

1. In the Firebase console, go to **Build → Firestore Database**
2. Click **"Create database"**
3. Select a region (e.g. `us-east1` for Florida) → click **Next**
4. Choose **"Start in production mode"** → click **Enable**
5. Open **Firestore → Rules** and use secure defaults for your app

This repository ships production-ready rules: **authenticated users** can read shared county reference data, and each user can read and write **only their own** permit documents under `/artifacts/{appId}/users/{userId}/permits/`. Everything else is denied by default.

See `firestore.rules` for the production security rules. Deploy them with `npm run deploy:rules`.

Optional local development shortcut (temporary only):

- If you need quick unauthenticated testing, you can briefly use test mode rules.
- Revert to secure rules before sharing, staging, or production deployment.

**Enable Storage:**

1. Go to **Build → Storage**
2. Click **"Get started"** → choose test mode → pick the same region → click **Done**

**Enable Authentication:**

1. Go to **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method**, enable **Email/Password**
4. Click **Save**

> **Free tier:** Firebase's Spark (free) plan includes 1 GB Firestore storage, 5 GB Storage, and 10K auth users/month — more than enough for a permit coordination team.

---

### Gemini API Key (AI Pre-Flight Scan / OCR)

Gemini powers the document OCR (extracting Parcel IDs from deeds, Max Floor Load from data plates, recording stamps from NOCs) and the AI Pre-Flight compliance analysis.

**Step-by-step:**

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **"Get API key"** in the top-left sidebar
4. Click **"Create API key"** → select your Firebase project from the dropdown (or create a new project)
5. Copy the generated key (starts with `AIza...`)

6. Add it to your `.env`:

```env
VITE_GEMINI_API_KEY=AIza...
```

> **Free tier:** Gemini 2.5 Flash has a free quota of 15 requests/minute and 1,500 requests/day — sufficient for a small team. Paid usage is billed per million tokens.

> **Note:** The AI Pre-Flight Scan requires a network connection. All compliance guardrails (wind zone, flood zone) run locally and work offline.

---

### Complete `.env` File

Your finished `.env` should look like this:

```env
# Firebase
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=yourproject.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=yourproject
VITE_FIREBASE_STORAGE_BUCKET=yourproject.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Gemini AI
VITE_GEMINI_API_KEY=AIzaSy...
```

> `.env` is in `.gitignore` and will never be committed to your repository.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start web dev server (localhost:5173) |
| `npm run dev:electron` | Start Electron desktop dev mode |
| `npm run build` | Production web build → `dist/` |
| `npm run build:electron` | Production Electron build → `release/` |
| `npm run lint` | ESLint across the repo |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:ui` | Vitest UI |
| `npm run preview` | Preview production web build locally |
| `npm run electron:preview` | Preview Electron build (`ELECTRON=true vite preview`) |

---

## Project Structure

```
src/
├── components/
│   ├── ai/          # OCR drop zone, pre-flight report
│   ├── auth/        # ProtectedRoute and related auth UI wiring
│   ├── checklist/   # Dynamic checklist (changes per county + home type)
│   ├── compliance/  # Wind zone and flood zone alert panels
│   ├── county/      # County selector, detail, fee schedule
│   ├── dashboard/   # Flight Deck cards and stats
│   ├── layout/      # App shell, sidebar, top bar, mobile nav, offline banner
│   ├── pdf/         # PDF viewer with zoom/rotate
│   ├── permit/      # 6-step permit wizard
│   └── shared/      # Button, Input, Select, Modal, Toast, ErrorBoundary, etc.
├── config/
│   ├── firebase.ts  # Firebase init with offline persistence
│   ├── gemini.ts    # Gemini 2.5 Flash client
│   └── constants.ts # Wind zone map for all 67 FL counties
├── data/
│   └── counties.json # 67-county database (bundled, works offline)
├── hooks/           # useAuth, useFirestorePermits, usePlatform
├── pages/           # Route-level page components
├── services/
│   ├── ai/          # Gemini OCR service + prompt templates
│   ├── checklist/   # County + home type checklist generator
│   ├── compliance/  # Wind/flood zone logic (offline, deterministic)
│   ├── fees/        # Permit fee calculator from county schedules
│   └── firestore/   # Firestore CRUD + Firebase Storage upload
├── stores/          # Zustand stores (permits, counties, UI, auth)
├── types/           # TypeScript interfaces for all domain objects
└── utils/           # Formatters, validators, platform detection
electron/
├── main.ts          # Electron main process + native file dialog IPC
└── preload.ts       # Context bridge (exposes electronAPI to renderer)
```0000000000000000000000000000000000000000000000000

0---

## Florida Wind Zones

The compliance engine automatically validates the home's wind zone rating against the county requirement.

| Zone | Counties | Requirement |
|------|----------|-------------|
| Zone I | None assigned in FL | Lowest |
| Zone II | Most interior counties (Ala000chua, Orange, Polk, etc.) | Standard |
| Zone III | Coastal / HVHZ (Miami-Dade, Broward, Palm Beach, Monroe, Collier, Lee, Pinellas, Escambia, etc.) | Highest |

> A Zone II home placed in a Zone III county will trigger an immediate **fail** on the pre-flight scan.

---

## Firestore Data Paths

```
/artifacts/{appId}/public/data/counties/{countyId}     ← 67 county docs (read-only)
/artifacts/{appId}/users/{userId}/permits/{permitId}   ← per-user permit packets
```

---

## Home Type Workflows

### Mobile Home (HUD Code)
Governed by Florida DHSMV. Required fields:
- HUD Certification Label number
- Installer License (IH#) — format `IH12345`
- Anchor/blocking chart (PDF upload)
- Wind Zone rating must meet or exceed county requirement

### Modular Home (FBC)
Governed by DBPR / Florida Building Code. Required fields:
- DBPR contractor license number
- Data Plate (manufacturer, max floor load ≥ 40 lbs/ft², thermal zone)
- Permanent foundation plans (PDF upload)

---

## Offline Support

The app is designed to work without internet:

- All 67 county records are **bundled** in `src/data/counties.json`
- Firestore uses **IndexedDB persistence** — permits cached locally survive browser/app restarts
- Compliance checks (wind zone, flood zone) run **entirely locally**
- Only the AI Pre-Flight Scan and cloud sync require a network connection

---

## PWA support

The web app is **installable** as a progressive web app: `public/manifest.json` is linked from `index.html`, and [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) generates a service worker in production builds with `registerType: 'autoUpdate'` so cached assets refresh when you ship a new version. Use **Install** or **Add to Home Screen** from a    supported browser. The Electron dev/build path does not enable the PWA plugin.

---

## Dark mode

The UI follows system preference by default and can be switched explicitly: use the theme control in the **TopBar** and the same option under **Settings**. Preference is persisted via `uiStore` (`initDarkMode()` runs on s
.0  gftartup in `main.tsx`).
022220000000