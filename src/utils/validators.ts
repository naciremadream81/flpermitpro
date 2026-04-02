import { z } from 'zod';

export const partyInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
});

export const vinSchema = z.string().min(1, 'Serial/VIN number is required');

export const parcelIdSchema = z.string().min(1, 'Parcel ID is required');

export const hudLabelSchema = z.string().min(1, 'HUD Label number is required');

export const installerLicenseSchema = z.string().regex(/^IH\d+$/i, 'Invalid Installer License format (IH followed by numbers)');

/**
 * Validates a Florida manufactured-home Installer License number.
 * Format: "IH" prefix followed by exactly 5 digits (e.g., IH12345).
 * The DBPR issues these under Chapter 320, Florida Statutes.
 */
export function isValidInstallerLicense(license: string): boolean {
  return /^IH\d{5}$/.test(license);
}

/**
 * Validates a Florida DBPR (Department of Business & Professional Regulation)
 * contractor license number. Valid prefixes for construction are:
 *  - CBC (Building Contractor)
 *  - CGC (General Contractor)
 *  - CRC (Residential Contractor)
 * Each prefix is followed by one or more digits (e.g., CBC1234567).
 */
export function isValidDbprLicense(license: string): boolean {
  return /^(CBC|CGC|CRC)\d+$/.test(license);
}
