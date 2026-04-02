import type { HomeType, WindZone, FloodZone } from './home';

export interface ChecklistItemDefinition {
  id: string;
  label: string;
  description: string;
  required: boolean;
  category: 'documents' | 'inspections' | 'approvals' | 'permits';
  applicableWindZones?: WindZone[];
  applicableFloodZones?: FloodZone[];
}

export interface ChecklistTemplate {
  id: string;
  homeType: HomeType;
  items: ChecklistItemDefinition[];
}
