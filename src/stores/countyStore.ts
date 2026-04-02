import { create } from 'zustand';
import type { County } from '@/types';

interface CountyStore {
  counties: County[];
  loading: boolean;
  selectedCountyId: string | null;
  setCounties: (counties: County[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedCountyId: (id: string | null) => void;
  getCountyById: (id: string) => County | undefined;
}

export const useCountyStore = create<CountyStore>((set, get) => ({
  counties: [],
  loading: false,
  selectedCountyId: null,

  setCounties: (counties) => set({ counties }),
  setLoading: (loading) => set({ loading }),
  setSelectedCountyId: (id) => set({ selectedCountyId: id }),
  getCountyById: (id) => get().counties.find((c) => c.id === id),
}));
