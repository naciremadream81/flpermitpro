import { ShieldCheck, ShieldAlert, ShieldX, Clock, FileSearch, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { PreFlightResult, PermitDocument } from '@/types';
import { formatDateTime } from '@/utils/formatters';

interface AiPreFlightReportProps {
  result: PreFlightResult;
  documents?: PermitDocument[];
}

const LOW_CONFIDENCE_THRESHOLD = 0.7;

const statusConfig = {
  pass: { icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', label: 'All Clear' },
  warnings: { icon: ShieldAlert, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', label: 'Warnings Found' },
  fail: { icon: ShieldX, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Issues Found' },
};

function getRecommendation(result: PreFlightResult): {
  text: string;
  icon: typeof CheckCircle2;
  color: string;
} {
  if (result.overallStatus === 'pass') {
    return { text: 'Ready to submit', icon: CheckCircle2, color: 'text-green-600' };
  }
  if (result.checks.some(c => c.status === 'fail')) {
    return { text: 'Critical issues must be resolved', icon: XCircle, color: 'text-red-600' };
  }
  return { text: 'Review warnings before submitting', icon: AlertTriangle, color: 'text-yellow-600' };
}

export function AiPreFlightReport({ result, documents = [] }: AiPreFlightReportProps) {
  const config = statusConfig[result.overallStatus];
  const Icon = config.icon;

  const localChecks = result.checks.filter(c => c.category !== 'ai-review');
  const localPassed = localChecks.filter(c => c.status === 'pass').length;

  const lowConfidenceDocs = documents.filter(
    d => d.ocrResult && d.ocrResult.confidence < LOW_CONFIDENCE_THRESHOLD,
  );

  const recommendation = getRecommendation(result);
  const RecIcon = recommendation.icon;

  return (
    <div className="space-y-4">
      {/* AI Analysis Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Local Compliance Checks</p>
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
            {localPassed}/{localChecks.length} <span className="text-sm font-normal text-gray-500">passed</span>
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-1.5">
            <FileSearch size={12} className="text-gray-400" />
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">AI Document Review</p>
          </div>
          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
            {lowConfidenceDocs.length > 0 ? (
              <span className="text-yellow-600 dark:text-yellow-400">
                {lowConfidenceDocs.length} <span className="text-sm font-normal">flagged for review</span>
              </span>
            ) : (
              <span className="text-green-600 dark:text-green-400">
                All clear
              </span>
            )}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Recommendation</p>
          <div className="mt-1 flex items-center gap-1.5">
            <RecIcon size={16} className={recommendation.color} />
            <p className={`text-sm font-semibold ${recommendation.color}`}>{recommendation.text}</p>
          </div>
        </div>
      </div>

      {/* Overall status banner */}
      <div className={`flex items-center gap-3 rounded-xl p-4 ${config.bg}`}>
        <Icon size={28} className={config.color} />
        <div>
          <p className={`font-semibold ${config.color}`}>{config.label}</p>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            <span>Scanned {formatDateTime(result.scannedAt)}</span>
          </div>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {result.checks.filter(c => c.status === 'pass').length}/{result.checks.length} passed
          </p>
        </div>
      </div>

      {/* Individual checks */}
      <div className="space-y-2">
        {result.checks.map(check => {
          const itemColor = check.status === 'pass'
            ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10'
            : check.status === 'warning'
            ? 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10'
            : 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10';
          const dot = check.status === 'pass' ? 'bg-green-500' : check.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500';

          return (
            <div key={check.id} className={`rounded-lg border p-3 ${itemColor}`}>
              <div className="flex items-start gap-2">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {check.category === 'ai-review' && (
                      <span className="mr-1.5 inline-flex items-center rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                        AI
                      </span>
                    )}
                    {check.message}
                  </p>
                  {check.detail && <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{check.detail}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
