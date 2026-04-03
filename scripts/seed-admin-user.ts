/**
 * Create or update a Firebase Auth user marked as admin (custom claim `admin: true`).
 *
 * Requires the Firebase Admin SDK and a service account (not the web API key).
 *
 * Setup:
 *   1. Firebase Console → Project settings → Service accounts → Generate new private key.
 *   2. Save the JSON outside git, e.g. `secrets/firebase-adminsdk.json` (see .gitignore).
 *   3. In `.env` (gitignored), set:
 *        FIREBASE_SERVICE_ACCOUNT_PATH=./secrets/firebase-adminsdk.json
 *        SEED_ADMIN_EMAIL=you@example.com
 *        SEED_ADMIN_PASSWORD=your-secure-password
 *      Optional: SEED_ADMIN_DISPLAY_NAME=Admin
 *
 *   Or set GOOGLE_APPLICATION_CREDENTIALS to the JSON path instead of FIREBASE_SERVICE_ACCOUNT_PATH.
 *
 * Usage:
 *   npm run seed:admin
 *
 * Idempotent: if the email exists, updates password (when provided) and reapplies admin claims.
 */

import { readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

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
    if (!(key in process.env) || process.env[key] === '') {
      process.env[key] = value;
    }
  }
} catch {
  console.error('Could not read .env at', envPath);
  process.exit(1);
}

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.env.SEED_ADMIN_EMAIL?.trim();
const password = process.env.SEED_ADMIN_PASSWORD ?? '';
const displayName = process.env.SEED_ADMIN_DISPLAY_NAME?.trim() || 'Admin';
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();

if (!email) {
  console.error('Set SEED_ADMIN_EMAIL in .env');
  process.exit(1);
}
if (password.length < 6) {
  console.error('SEED_ADMIN_PASSWORD must be at least 6 characters (Firebase requirement).');
  process.exit(1);
}

function initAdmin() {
  if (getApps().length > 0) return;

  if (serviceAccountPath) {
    const abs = resolve(process.cwd(), serviceAccountPath);
    if (!existsSync(abs)) {
      const parent = dirname(abs);
      if (!existsSync(parent)) {
        try {
          mkdirSync(parent, { recursive: true });
          console.error(`Created directory: ${parent}`);
        } catch {
          // ignore; error below still explains what’s missing
        }
      }
      console.error(
        'Service account JSON not found at:\n' +
          `  ${abs}\n\n` +
          'Download it from Firebase Console:\n' +
          '  Project settings (gear) → Service accounts → Generate new private key\n' +
          'Save the file exactly there, or change FIREBASE_SERVICE_ACCOUNT_PATH in .env to match where you saved it.\n' +
          '(That file is secret — never commit it; secrets/ is gitignored.)',
      );
      process.exit(1);
    }
    const raw = readFileSync(abs, 'utf-8');
    const sa = JSON.parse(raw) as Record<string, string>;
    initializeApp({ credential: cert(sa) });
    return;
  }

  if (gac) {
    initializeApp();
    return;
  }

  console.error(
    'Set FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/serviceAccount.json in .env,\n' +
      'or set GOOGLE_APPLICATION_CREDENTIALS to that file path.',
  );
  process.exit(1);
}

async function main() {
  initAdmin();
  const auth = getAuth();

  let uid: string;
  try {
    const created = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: true,
    });
    uid = created.uid;
    console.log(`Created user ${email} (${uid})`);
  } catch (e: unknown) {
    const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : '';
    if (code === 'auth/email-already-exists') {
      const existing = await auth.getUserByEmail(email);
      uid = existing.uid;
      await auth.updateUser(uid, {
        password,
        displayName: displayName || existing.displayName,
        emailVerified: true,
      });
      console.log(`Updated existing user ${email} (${uid})`);
    } else {
      throw e;
    }
  }

  await auth.setCustomUserClaims(uid, { admin: true });
  console.log('Set custom claims: { admin: true }');
  console.log('\nDone. Sign in in the app with this email and password.');
  console.log('If the app reads admin claims later, the user may need to sign out and back in to refresh the token.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
