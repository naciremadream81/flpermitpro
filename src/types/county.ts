import type { HomeType, WindZone } from './home';

export interface FeeScheduleEntry {
  description: string;
  amount: number;
  unit: 'flat' | 'per-sqft' | 'percentage';
  appliesTo: HomeType | 'both';
}

export interface County {
  id: string;
  name: string;
  fipsCode: string;
  windZone: WindZone;
  propertyAppraiserUrl: string;
  buildingDeptUrl: string;
  buildingDeptPhone: string;
  feeSchedule: FeeScheduleEntry[];
  specialRequirements: string[];
  mobileHomeChecklist: string[];
  modularHomeChecklist: string[];
}
