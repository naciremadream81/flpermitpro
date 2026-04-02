import { useMemo } from 'react';
import { getPlatform, isElectron, isCapacitor, isWeb, isNativePlatform } from '@/utils/platform';

export function usePlatform() {
  return useMemo(() => ({
    platform: getPlatform(),
    isElectron: isElectron(),
    isCapacitor: isCapacitor(),
    isNative: isNativePlatform(),
    isWeb: isWeb(),
    isMobile: isCapacitor(),
    isDesktop: isElectron() || isWeb(),
  }), []);
}
