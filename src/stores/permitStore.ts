import { create } from 'zustand';
import type { PermitPacket, PermitStatus } from '@/types';

interface PermitFilters {
  status: PermitStatus | 'all';
  homeType: 'mobile' | 'modular' | 'all';
  county: string | 'all';
  search: string;
}

interface PermitStore {
  permits: PermitPacket[];
  loading: boolean;
  error: string | null;
  filters: PermitFilters;
  selectedPermitId: string | null;
  setPermits: (permits: PermitPacket[]) => void;
  addPermit: (permit: PermitPacket) => void;
  updatePermit: (id: string, updates: Partial<PermitPacket>) => void;
  removePermit: (id: string) => void;
  setFilters: (filters: Partial<PermitFilters>) => void;
  setSelectedPermitId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  filteredPermits: () => PermitPacket[];
}

export const usePermitStore = create<PermitStore>((set, get) => ({
  permits: [],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    homeType: 'all',
    county: 'all',
    search: '',
  },
  selectedPermitId: null,

  setPermits: (permits) => set({ permits }),
  addPermit: (permit) => set((s) => ({ permits: [...s.permits, permit] })),
  updatePermit: (id, updates) =>
    set((s) => ({
      permits: s.permits.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  removePermit: (id) =>
    set((s) => ({ permits: s.permits.filter((p) => p.id !== id) })),
  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),
  setSelectedPermitId: (id) => set({ selectedPermitId: id }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  filteredPermits: () => {
    const { permits, filters } = get();
    return permits.filter((p) => {
      if (filters.status !== 'all' && p.status !== filters.status) return false;
      if (filters.homeType !== 'all' && p.homeType !== filters.homeType) return false;
      if (filters.county !== 'all' && p.countyId !== filters.county) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          p.siteAddress.toLowerCase().includes(q) ||
          p.owner.name.toLowerCase().includes(q) ||
          p.parcelId.toLowerCase().includes(q) ||
          p.countyName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  },
}));
