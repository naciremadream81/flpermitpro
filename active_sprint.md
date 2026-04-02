# PermitPro FL — Active Sprint

> **Framework:** Architect-Builder-Scout  
> **Initialized:** 2026-03-31  
> **Version:** 0.1.0  
> **Sprint Goal:** Bring the codebase from _scaffold-complete_ to _demo-ready alpha_

---

## 1. System Map (Architect's Assessment)

### What Exists (Verified)

| Layer | Status | Notes |
|-------|--------|-------|
| **Routing** | Done | 8 routes incl. `/login`, `/register`, shell routes, `*` |
| **Layout Shell** | Done | `AppShell` + `Sidebar` + `TopBar` + `MobileNav` |
| **Type System** | Done | `PermitPacket`, `PartyInfo`, `PermitFees`, `ComplianceCheck`, `OcrResult`, etc. |
| **Zustand Stores** | Done | `permitStore`, `countyStore`, `authStore`, `uiStore` |
| **67-County Database** | Done | Bundled JSON + `WIND_ZONE_MAP` constant covering all 67 FL counties |
| **Compliance Engine** | Done | `windZone.ts`, `floodZone.ts`, `engine.ts` — runs offline, deterministic |
| **Firestore CRUD** | Done | `savePermit`, `patchPermit`, `deletePermit`, `subscribePermits` with serialization |
| **Firebase Storage** | Done | Upload service for permit documents |
| **Gemini OCR** | Done | `extractDocumentData()` — deed, data plate, NOC prompts |
| **PDF Viewer** | Done | `react-pdf` with zoom, rotate, thumbnails, toolbar |
| **Permit Wizard** | Done | 6-step flow with HUD vs FBC branching |
| **Shared Components** | Done | Button, Input, Select, Modal, Toast, StatusBadge, etc. |

### What's Missing or Incomplete

| Gap | Severity | Detail |
|-----|----------|--------|
| **Coverage vs. goal** | Medium | Many `/services` paths are tested, but sprint target was >60% coverage on `/services` — verify with `vitest --coverage` |
| **Production build (tsc)** | Medium | `npm run build` must pass `tsc -b`; fix remaining strict errors (e.g. `PermitDocument.downloadUrl` in tests, unused vars) |
| **Firestore runtime typing** | Low | `deserializePermit` still uses `as unknown as` chains — acceptable for now, tighten if schemas evolve |
| **Stream 4 follow-through** | Low | Pre-flight wiring, storage paths, and Capacitor camera polish — iterate as needed |
| **Stream 5 breadth** | Low | Toasts/skeletons/offline banner exist; confirm every CRUD path surfaces errors and responsive audit stays current |

---

## 2. Master Plan — Five Parallel Streams

Each stream is independent and can be worked in parallel by a Builder agent.
Dependencies between streams are called out explicitly.

---

### Stream 1: Foundation & Testing Infrastructure

**Goal:** Make the codebase trustworthy — every critical path has a test, CI catches regressions.

| # | Ticket | File(s) | Acceptance Criteria | Status |
|---|--------|---------|---------------------|--------|
| 1.1 | Add Vitest config for component tests | `vitest.config.ts`, new `vitest.setup.ts` | `jsdom` environment configured; `@testing-library/react` installed | Done |
| 1.2 | Unit-test the compliance engine fully | `services/compliance/__tests__/engine.test.ts` | Tests for: mobile missing HUD label, modular missing DBPR, NOC warning, overall pass/fail/warning | Done |
| 1.3 | Unit-test Firestore serialization round-trip | `services/firestore/__tests__/permits.test.ts` | `serializePermit` → `deserializePermit` returns identical object; Date fields survive | Done |
| 1.4 | Unit-test OCR service (mocked Gemini) | `services/ai/__tests__/ocrService.test.ts` | Mock `geminiFlash.generateContent`; verify JSON extraction and fallback | Done |
| 1.5 | Add GitHub Actions CI workflow | `.github/workflows/ci.yml` | `npm run lint`, `npm test`, `npm run build` on push to `main` and all PRs | Done (build must stay green) |

**Scout Note:** Install `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` as dev dependencies before starting 1.1.

---

### Stream 2: Authentication & Security

**Goal:** Users must sign in to access the app. Route guards enforce this.

| # | Ticket | File(s) | Acceptance Criteria | Status |
|---|--------|---------|---------------------|--------|
| 2.1 | Create `LoginPage` with email/password | `src/pages/LoginPage.tsx` | Firebase `signInWithEmailAndPassword`; error states for wrong creds; link to register | Done |
| 2.2 | Create `RegisterPage` | `src/pages/RegisterPage.tsx` | Firebase `createUserWithEmailAndPassword`; zod validation; redirect to `/` on success | Done |
| 2.3 | Build `ProtectedRoute` wrapper | `src/components/auth/ProtectedRoute.tsx` | Redirects to `/login` if `!user`; wraps all routes except `/login` and `/register` | Done |
| 2.4 | Update `App.tsx` routes | `src/App.tsx` | Add `/login` and `/register` outside `ProtectedRoute`; wrap existing routes | Done |
| 2.5 | Add sign-out button to Settings | `src/pages/SettingsPage.tsx` | Firebase `signOut()`; clears Zustand auth store; redirects to `/login` | Done |

**Scout Note:** `useAuth` hook already calls `onAuthStateChanged` — wire it into `ProtectedRoute`. No new Firebase config needed.

---

### Stream 3: Core Business Logic Hardening

**Goal:** The compliance engine, checklist generator, and fee calculator are complete and correct.

| # | Ticket | File(s) | Acceptance Criteria |
|---|--------|---------|---------------------|
| 3.1 | Expand compliance engine: data plate checks | `services/compliance/engine.ts` | Modular: verify `maxFloorLoad >= 40`; verify `thermalZone` matches FL range |
| 3.2 | Add installer license format validation | `src/utils/validators.ts`, `services/compliance/engine.ts` | Mobile: `IH\d{5}` regex; fail if format invalid |
| 3.3 | Build dynamic checklist generator | `services/checklist/generator.ts` (new) | Takes `countyId` + `homeType` → returns county-specific checklist; reads from `counties.json` |
| 3.4 | Implement fee calculator from county data | `services/fees/calculator.ts` (new) | Reads county fee schedule; computes permit + impact + plan review + sales tax = total |
| 3.5 | Wire `FinancialSummary` to live fee calculator | `components/permit/FinancialSummary.tsx` | Displays real calculated fees; updates when county or home type changes |

**Scout Note:** `counties.json` already has `feeSchedule` entries per county — the data is there, the calculator just needs to consume it.

---

### Stream 4: AI & Document Pipeline

**Goal:** OCR returns real confidence scores, Pre-Flight report is actionable, camera capture works.

| # | Ticket | File(s) | Acceptance Criteria |
|---|--------|---------|---------------------|
| 4.1 | Parse Gemini confidence from response | `services/ai/ocrService.ts` | Prompt Gemini to return `confidence: 0.0–1.0` in its JSON; extract and use it |
| 4.2 | Add Pre-Flight scan trigger to PermitDetail | `pages/PermitDetailPage.tsx`, `components/ai/AiPreFlightReport.tsx` | "Run Pre-Flight" button calls `runComplianceChecks` + Gemini analysis; displays results |
| 4.3 | Wire `DocumentUploadZone` to Firebase Storage | `components/ai/DocumentUploadZone.tsx`, `services/firestore/storage.ts` | Upload file → store in Firebase Storage → save `storagePath` on `PermitDocument` |
| 4.4 | Integrate OCR auto-extraction on upload | `components/ai/OcrDropZone.tsx` | After upload, automatically call `extractDocumentData`; populate `OcrResultCard` |
| 4.5 | Connect `CameraCapture` to Capacitor Camera API | `components/ai/CameraCapture.tsx` | On mobile: open device camera; on desktop: show file picker fallback |

**Scout Note:** Ticket 4.5 is blocked until Capacitor packages are installed. Can be deferred to Sprint 2 without impacting desktop/web demo.

---

### Stream 5: UX, Polish & Error Handling

**Goal:** The app looks production-ready, handles errors gracefully, and provides clear feedback.

| # | Ticket | File(s) | Acceptance Criteria |
|---|--------|---------|---------------------|
| 5.1 | Add global `ErrorBoundary` | `src/components/shared/ErrorBoundary.tsx`, `src/App.tsx` | Catches render errors; shows friendly fallback with "Retry" button |
| 5.2 | Add Toast notifications for CRUD operations | All pages that call Firestore | Success toast on save/delete; error toast on failure; uses existing `Toast` component |
| 5.3 | Add loading skeletons to Dashboard | `components/dashboard/PermitCard.tsx`, `pages/DashboardPage.tsx` | Skeleton pulse animation while `loading === true`; no layout shift on data arrival |
| 5.4 | Add offline indicator banner | `src/components/layout/AppShell.tsx` | Detects `navigator.onLine === false`; shows amber banner "Working offline — changes sync when reconnected" |
| 5.5 | Responsive audit: test all pages at 375px, 768px, 1440px | All pages | No horizontal scroll; sidebar collapses on mobile; wizard steps stack vertically |

---

## 3. Stream Dependency Graph

```
Stream 1 (Tests)         ──────────────────────────────────┐
Stream 2 (Auth)          ──────────────────────────────────┤
Stream 3 (Business Logic)──────────────────────────────────┼──▶ Integration Tests ──▶ Alpha Release
Stream 4 (AI/Docs)       ──────────────────────────────────┤
Stream 5 (UX/Polish)     ──────────────────────────────────┘
                                                        ▲
                                              All 5 streams
                                              run in parallel
```

**Cross-stream dependencies (call them out when assigning):**
- Ticket 4.5 (Camera) depends on Capacitor package install (not yet in `package.json`)
- Ticket 5.2 (Toasts) should be done _after_ Stream 2 auth flows exist so toasts cover login errors
- Stream 1 tests should be written _alongside_ Streams 2–4, not after

---

## 4. Current Codebase Stats

| Metric | Value |
|--------|-------|
| Source files | 120+ (approx.) |
| TypeScript strict | Yes (`tsconfig.app.json`) |
| Routes | 8 (`/login`, `/register`, shell routes, `*`) |
| Components | 30+ across feature folders (incl. `auth/`) |
| Zustand stores | 4 (`auth`, `permit`, `county`, `ui`) |
| Test files | 8 (compliance, firestore, OCR, fees, checklist, validators, etc.) |
| Counties in DB | 67 (all Florida) |
| Wind zones mapped | 67/67 |
| Permit statuses | 6 (`draft` → `approved`/`rejected`) |
| Document types | 8 |
| Firebase services | Auth + Firestore + Storage |
| AI integration | Gemini 2.5 Flash (OCR + pre-flight) |

---

## 5. Definition of Done (Sprint-Level)

A ticket is **done** when:

1. Code compiles with zero TypeScript errors (`tsc -b`)
2. All new functions have at least one unit test
3. No ESLint errors (`npm run lint`)
4. The feature works in the browser at `localhost:5173`
5. The commit message follows conventional commits (`feat:`, `fix:`, `test:`, `chore:`)

The **sprint is done** when:

- [x] A user can register, log in, and log out
- [x] A user can create a permit packet through the full wizard
- [x] The compliance engine flags invalid wind zone / missing documents
- [x] Documents can be uploaded and OCR-extracted
- [x] The dashboard shows all permits with filtering
- [x] Errors are caught and displayed (not white-screen crashes) — global `ErrorBoundary` + friendly fallback
- [ ] `npm test` passes with > 60% coverage on `/services/` (tests exist; confirm coverage %)
- [ ] `npm run build` passes TypeScript (`tsc -b`) without errors

---

## 6. Next Sprint Preview (Sprint 2)

Originally deferred; **now in place or in progress:**

- **Capacitor** — `@capacitor/core`, `@capacitor/camera`, `@capacitor/filesystem`, `@capacitor/preferences`, and CLI are in the project; native workflows still deserve hardening (Stream 4.5).
- **PWA** — `vite-plugin-pwa` (Workbox, `registerType: 'autoUpdate'`, `injectRegister: 'auto'`) plus `public/manifest.json` and installable web behavior.
- **Dark mode** — `uiStore` + `initDarkMode()`; toggle from TopBar and Settings.

**Still deferred / future:**

- Firestore security rules hardening (beyond basic `auth != null`)
- Multi-user collaboration (shared permit packets)
- PDF annotation and signature fields

---

## 7. Sprint 3 — Core business logic & housekeeping (completed scope)

Work delivered in this phase (Stream 3 + cleanup):

- **Compliance hardening** — Data plate rules, installer license `IH\d{5}` validation (see `engine.ts`, `validators.ts`).
- **Dynamic checklist** — `services/checklist/generator.ts` with tests; county + home type driven.
- **Fee calculator** — `services/fees/calculator.ts` with tests; `FinancialSummary` uses live totals from county fee schedules.
- **Dead code / docs** — Removed unused `ErrorBoundaryWrapper`; service worker registration delegated to `vite-plugin-pwa` (`injectRegister: 'auto'`); removed unused Vite template `App.css`; README and this file updated for PWA, dark mode, and structure.
