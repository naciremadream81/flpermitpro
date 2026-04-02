import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useAuthStore } from '@/stores/authStore';
import type { UserProfile } from '@/types';

export function useAuth() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const profile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? '',
          company: '',
          licenseNumber: '',
          createdAt: new Date(firebaseUser.metadata.creationTime ?? Date.now()),
        };
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [setUser, setLoading]);

  return useAuthStore();
}
