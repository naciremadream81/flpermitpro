/**
 * Seed Firestore with all 67 Florida county records.
 *
 * Usage:
 *   npx tsx scripts/seed-counties.ts
 *
 * Prerequisites:
 *   - .env file with VITE_FIREBASE_* variables
 *   - npm install tsx dotenv (if not already installed)
 *
 * The script writes to:
 *   /artifacts/{appId}/public/data/counties/{countyId}
 *
 * Safe to run multiple times — uses setDoc (upsert).
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Load .env manually (tsx doesn't auto-load it)
// ---------------------------------------------------------------------------
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, '..', '.env');

try {
  const envFile = readFileSync(envPath, 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = value;
  }
} catch {
  console.error('Could not read .env file at', envPath);
  console.error('Copy .env.example to .env and fill in your Firebase keys first.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Firebase init
// ---------------------------------------------------------------------------
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';

const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const app = initializeApp({
  apiKey:            process.env.VITE_FIREBASE_API_KEY!,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.VITE_FIREBASE_APP_ID!,
});

const db = getFirestore(app);

// ---------------------------------------------------------------------------
// Load county data
// ---------------------------------------------------------------------------
const countiesPath = resolve(__dir, '..', 'src', 'data', 'counties.json');
const counties: Record<string, unknown>[] = JSON.parse(readFileSync(countiesPath, 'utf-8'));

// The Firestore path mirrors the in-app path:
//   artifacts/{appId}/public/data/counties/{countyId}
const APP_ID = process.env.VITE_FIREBASE_APP_ID!;

async function seed() {
  const col = collection(db, 'artifacts', APP_ID, 'public', 'data', 'counties');
  let written = 0;
  let failed = 0;

  for (const county of counties) {
    const countyId = county.id as string;
    try {
      await setDoc(doc(col, countyId), county);
      process.stdout.write(`  ✓ ${countyId}\n`);
      written++;
    } catch (err) {
      process.stderr.write(`  ✗ ${countyId}: ${String(err)}\n`);
      failed++;
    }
  }

  console.log(`\nDone — ${written} written, ${failed} failed (of ${counties.length} total counties).`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}

console.log(`Seeding ${counties.length} Florida counties to Firestore project "${process.env.VITE_FIREBASE_PROJECT_ID}"...\n`);
seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
