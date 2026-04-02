import { ShieldCheck, ShieldAlert, ShieldX, Loader } from 'lucide-react';
import { WindZoneAlert } from './WindZoneAlert';
import { FloodZoneAlert } from './FloodZoneAlert';
import { Button } from '@/components/shared/Button';
import type { PreFlightResult, PermitPacket } from '@/types';

interface CompliancePanelProps {
  permit: PermitPacket;
  onRunScan: () => void;
  scanning: boolean;
}

const StatusIcon = ({ status }: { status: PreFlightResult['overallStatus'] }) => {
  if (status === 'pass') return <ShieldCheck size={22} className="text-green-500" />;
  if (status === 'warnings') return <ShieldAlert size={22} className="text-yellow-500" />;
  return <ShieldX size={22} className="text-red-500" />;
};

export function CompliancePanel({ permit, onRunScan, scanning }: CompliancePanelProps) {
  const scan = permit.lastPreFlightScan;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {scan ? <StatusIcon status={scan.overallStatus} /> : <ShieldCheck size={22} className="text-gray-400" />}
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Compliance Pre-Flight</h3>
        </div>
        <Button variant="primary" size="sm" onClick={onRunScan} loading={scanning}>
          {scan ? 'Re-run Scan' : 'Run AI Pre-Flight Scan'}
        </Button>
      </div>

      {scan && (
        <div className="mt-4 space-y-3">
          {scan.checks.map(check => {
            if (check.category === 'wind-zone') return <WindZoneAlert key={check.id} check={check} />;
            if (check.category === 'flood-zone') return <FloodZoneAlert key={check.id} check={check} />;
            return (
              <div key={check.id} className={`rounded-lg border p-3 text-sm ${check.status === 'pass' ? 'border-green-200 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300' : check.status === 'warning' ? 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' : 'border-red-200 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'}`}>
                <p className="font-medium">{check.message}</p>
                {check.detail && <p className="mt-0.5 text-xs opacity-80">{check.detail}</p>}
              </div>
            );
          })}
        </div>
      )}

      {!scan && !scanning && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Run a pre-flight scan to check wind zone compliance, flood zone requirements, document completeness, and license verification.
        </p>
      )}

      {scanning && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <Loader size={14} className="animate-spin" />
          Analyzing permit packet...
        </div>
      )}
    </div>
  );
}
