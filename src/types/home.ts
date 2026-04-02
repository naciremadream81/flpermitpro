export type HomeType = 'mobile' | 'modular';
export type WindZone = 'I' | 'II' | 'III';
export type FloodZone = 'X' | 'AE' | 'VE' | 'A' | 'AH' | 'AO' | 'other';
export type PropertyClassification = 'personal' | 'real';

export interface HomeBase {
  homeType: HomeType;
  year: number | null;
  make: string;
  model: string;
  serialNumber: string;
  propertyClassification: PropertyClassification;
  windZoneRating: WindZone;
}

export interface MobileHome extends HomeBase {
  homeType: 'mobile';
  hudLabelNumber: string;
  installerLicenseNumber: string;
  installerName: string;
  anchorPattern: string;
  blockingChartRef: string;
}

export interface ModularHome extends HomeBase {
  homeType: 'modular';
  dataPlateInfo: {
    manufacturer: string;
    maxFloorLoad: number | null;
    thermalZone: string;
  };
  foundationPlanRef: string;
  dbprLicenseNumber: string;
}
