import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PermitWizard } from '@/components/permit/PermitWizard';
import { usePermitStore } from '@/stores/permitStore';
import { useCountyStore } from '@/stores/countyStore';
import countiesData from '@/data/counties.json';
import type { County } from '@/types';

/**
 * Loads an existing permit by its URL param and hands it to the PermitWizard
 * in edit mode. The wizard pre-fills every field so the user can correct any
 * value and submit a patch rather than re-creating the whole packet.
 */
export function EditPermitPage() {
  const { permitId } = useParams<{ permitId: string }>();
  const { permits } = usePermitStore();
  const { setCounties, counties } = useCountyStore();

  useEffect(() => {
    if (counties.length === 0) setCounties(countiesData as County[]);
  }, [counties.length, setCounties]);

  const permit = permits.find(p => p.id === permitId);

  if (!permit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-gray-500">Permit not found.</p>
        <Link to="/" className="mt-4 text-blue-600 hover:underline">Back to Flight Deck</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to={`/permits/${permit.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-700 dark:hover:text-gray-300"
      >
        <ArrowLeft size={15} />
        Back to permit details
      </Link>
      <PermitWizard existingPermit={permit} />
    </div>
  );
}
