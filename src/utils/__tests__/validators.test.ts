import { describe, it, expect } from 'vitest';
import { isValidInstallerLicense, isValidDbprLicense } from '../validators';

describe('isValidInstallerLicense', () => {
  // ── 1. Valid: "IH12345" (IH + 5 digits) ───────────────────────────
  it('accepts "IH12345" as valid', () => {
    expect(isValidInstallerLicense('IH12345')).toBe(true);
  });

  it('accepts "IH00001" as valid', () => {
    expect(isValidInstallerLicense('IH00001')).toBe(true);
  });

  // ── 2. Invalid: too short ("IH1234" — only 4 digits) ──────────────
  it('rejects "IH1234" (too few digits)', () => {
    expect(isValidInstallerLicense('IH1234')).toBe(false);
  });

  // ── 3. Invalid: wrong prefix ("XH12345") ──────────────────────────
  it('rejects "XH12345" (wrong prefix)', () => {
    expect(isValidInstallerLicense('XH12345')).toBe(false);
  });

  // ── 7. Invalid: empty string ──────────────────────────────────────
  it('rejects an empty string', () => {
    expect(isValidInstallerLicense('')).toBe(false);
  });

  it('rejects "IH123456" (too many digits)', () => {
    expect(isValidInstallerLicense('IH123456')).toBe(false);
  });

  it('rejects lowercase "ih12345"', () => {
    expect(isValidInstallerLicense('ih12345')).toBe(false);
  });
});

describe('isValidDbprLicense', () => {
  // ── 4. Valid: "CBC1234567" ─────────────────────────────────────────
  it('accepts "CBC1234567" as valid', () => {
    expect(isValidDbprLicense('CBC1234567')).toBe(true);
  });

  // ── 5. Valid: "CGC123" ─────────────────────────────────────────────
  it('accepts "CGC123" as valid', () => {
    expect(isValidDbprLicense('CGC123')).toBe(true);
  });

  it('accepts "CRC999" as valid', () => {
    expect(isValidDbprLicense('CRC999')).toBe(true);
  });

  // ── 6. Invalid: wrong prefix ("ABC12345") ─────────────────────────
  it('rejects "ABC12345" (wrong prefix)', () => {
    expect(isValidDbprLicense('ABC12345')).toBe(false);
  });

  // ── 7. Invalid: empty string ──────────────────────────────────────
  it('rejects an empty string', () => {
    expect(isValidDbprLicense('')).toBe(false);
  });

  it('rejects "CBC" with no digits', () => {
    expect(isValidDbprLicense('CBC')).toBe(false);
  });

  it('rejects lowercase "cbc1234567"', () => {
    expect(isValidDbprLicense('cbc1234567')).toBe(false);
  });
});
