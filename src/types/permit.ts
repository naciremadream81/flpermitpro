import type { HomeType, MobileHome, ModularHome, WindZone, FloodZone } from './home';

export type PermitStatus = 'draft' | 'in-progress' | 'review' | 'submitted' | 'approved' | 'rejected';

export interface PartyInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
}

export interface PermitFees {
  permitFee: number;
  impactFee: number;
  planReviewFee: number;
  salesTaxRate: number;
  salesTaxAmount: number;
  totalFees: number;
}

export interface OcrResult {
  extractedFields: Record<string, string>;
  confidence: number;
  rawText: string;
}

export type DocumentType = 'site-plan' | 'blocking-chart' | 'deed' | 'data-plate'
  | 'elevation-cert' | 'noc' | 'floor-plan' | 'other' | 'signed-pdf';

export type DocumentApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface PermitDocument {
  id: string;
  fileName: string;
  fileType: DocumentType;
  storagePath: string;
  downloadUrl: string;
  uploadedAt: Date;
  ocrResult: OcrResult | null;
  /** When this PDF was created by stamping a signature onto another document */
  derivedFromDocumentId?: string;
  /** Approval workflow */
  approvalStatus?: DocumentApprovalStatus;
  approvedAt?: Date;
  approvedBy?: string;
  approvalNotes?: string;
}

export interface PermitPacket {
  id: string;
  /**
   * Back-compat field. Historically permits lived under `/users/{userId}/permits/{permitId}`.
   * We now store permits in a shared collection; `userId` is kept as the owner id.
   */
  userId: string;
  /**
   * Canonical owner of the permit packet.
   */
  ownerId: string;
  /**
   * UIDs that can access this permit packet (read + write for now).
   */
  sharedWith: string[];
  createdAt: Date;
  updatedAt: Date;
  status: PermitStatus;
  homeType: HomeType;
  home: MobileHome | ModularHome;
  countyId: string;
  countyName: string;
  siteAddress: string;
  parcelId: string;
  legalDescription: string;
  windZoneRequired: WindZone;
  floodZone: FloodZone;
  elevationCertRequired: boolean;
  owner: PartyInfo;
  contractor: PartyInfo;
  fees: PermitFees;
  documents: PermitDocument[];
  checklistItems: ChecklistItemState[];
  lastPreFlightScan: PreFlightResult | null;
  notes: string;
}

export interface PreFlightResult {
  scannedAt: Date;
  overallStatus: 'pass' | 'warnings' | 'fail';
  checks: ComplianceCheck[];
}

export interface ComplianceCheck {
  id: string;
  category: 'wind-zone' | 'flood-zone' | 'document' | 'license' | 'noc' | 'data-plate' | 'ai-review';
  status: 'pass' | 'warning' | 'fail';
  message: string;
  detail: string;
}

export interface ChecklistItemState {
  definitionId: string;
  label: string;
  completed: boolean;
  completedAt: Date | null;
  notes: string;
  /** Override/waiver fields */
  waived?: boolean;
  waivedAt?: Date | null;
  waivedBy?: string;
  waivedReason?: string;
}
