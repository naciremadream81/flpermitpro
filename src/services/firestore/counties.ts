import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { County } from '@/types';

const countiesCol = (appId: string) =>
  collection(db, 'artifacts', appId, 'public', 'data', 'counties');

export async function seedCounties(appId: string, counties: County[]): Promise<void> {
  const writes = counties.map(county =>
    setDoc(doc(countiesCol(appId), county.id), county),
  );
  await Promise.all(writes);
}

export async function fetchCounties(appId: string): Promise<County[]> {
  const snap = await getDocs(countiesCol(appId));
  return snap.docs.map(d => d.data() as County);
}
