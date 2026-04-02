import { useEffect } from 'react';
import { PermitWizard } from '@/components/permit/PermitWizard';
import { useCountyStore } from '@/stores/countyStore';
import countiesData from '@/data/counties.json';
import type { County } from '@/types';

export function NewPermitPage() {
  const { setCounties, counties } = useCountyStore();
  useEffect(() => {
    if (counties.length === 0) setCounties(countiesData as County[]);
  }, [counties.length, setCounties]);

  return <PermitWizard />;
}
