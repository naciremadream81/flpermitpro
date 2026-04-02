export const isElectron = (): boolean =>
  typeof window !== 'undefined' && !!(window as unknown as Record<string, unknown>).electronAPI;

export const isCapacitor = (): boolean =>
  typeof window !== 'undefined' && !!(window as unknown as Record<string, unknown>).Capacitor;

/** True when running inside a native Capacitor shell (iOS/Android). Avoids importing @capacitor/core in leaf modules. */
export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as { Capacitor?: { isNativePlatform: () => boolean } };
  return typeof w.Capacitor !== 'undefined' && w.Capacitor.isNativePlatform();
}

export const isWeb = (): boolean => !isElectron() && !isCapacitor();

export const getPlatform = (): 'electron' | 'capacitor' | 'web' => {
  if (isElectron()) return 'electron';
  if (isCapacitor()) return 'capacitor';
  return 'web';
};
