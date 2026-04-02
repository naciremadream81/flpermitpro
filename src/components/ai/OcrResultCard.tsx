import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { OcrResult, DocumentType } from '@/types';

interface OcrResultCardProps {
  result: OcrResult;
  documentType: DocumentType;
}

const FIELD_LABELS: Record<string, string> = {
  parcelId: 'Parcel ID',
  grantor: 'Grantor',
  grantee: 'Grantee',
  legalDescription: 'Legal Description',
  recordingInfo: 'Recording Info',
  manufacturer: 'Manufacturer',
  modelNumber: 'Model Number',
  serialNumber: 'Serial Number',
  maxFloorLoad: 'Max Floor Load (PSF)',
  windZone: 'Wind Zone',
  thermalZone: 'Thermal Zone',
  roofLoad: 'Roof Load (PSF)',
  dimensions: 'Dimensions',
  isRecorded: 'Recorded',
  recordingDate: 'Recording Date',
  instrumentNumber: 'Instrument Number',
  ownerName: 'Owner Name',
  contractorName: 'Contractor Name',
  propertyAddress: 'Property Address',
};

/**
 * Returns Tailwind classes for the confidence badge.
 *   >= 0.8 → green (high confidence)
 *   >= 0.5 → amber (moderate)
 *   <  0.5 → red  (low)
 */
function confidenceBadgeClasses(confidence: number): string {
  if (confidence >= 0.8)
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (confidence >= 0.5)
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
}

export function OcrResultCard({ result }: OcrResultCardProps) {
  const [rawExpanded, setRawExpanded] = useState(false);

  const fields = Object.entries(result.extractedFields).filter(
    ([, v]) => v != null && v !== '',
  );
  const pct = Math.round(result.confidence * 100);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      {/* Header with confidence badge */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Extracted Data</h3>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${confidenceBadgeClasses(result.confidence)}`}
        >
          {pct}% confidence
        </span>
      </div>

      {/* Extracted key-value pairs */}
      {fields.length === 0 ? (
        <p className="text-sm text-gray-500">No fields could be extracted from this document.</p>
      ) : (
        <dl className="space-y-2">
          {fields.map(([key, value]) => (
            <div key={key} className="flex gap-3 text-sm">
              <dt className="w-40 shrink-0 font-medium text-gray-500 dark:text-gray-400">
                {FIELD_LABELS[key] ?? key}
              </dt>
              <dd className="flex-1 text-gray-900 dark:text-gray-100 break-words">
                {String(value)}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {/* Collapsible raw text section */}
      {result.rawText && (
        <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setRawExpanded(prev => !prev)}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {rawExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Raw AI Response
          </button>
          {rawExpanded && (
            <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-300">
              {result.rawText}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
