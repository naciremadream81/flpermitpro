import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useForm, type FieldValues, type Control } from 'react-hook-form';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import { HomeTypeSelector } from './HomeTypeSelector';
import { MobileHomeFields } from './MobileHomeFields';
import { ModularHomeFields } from './ModularHomeFields';
import { OwnerInfoForm } from './OwnerInfoForm';
import { FinancialSummary } from './FinancialSummary';
import { DynamicChecklist } from '@/components/checklist/DynamicChecklist';
import { CountySelector } from '@/components/county/CountySelector';
import { usePermitStore } from '@/stores/permitStore';
import { useCountyStore } from '@/stores/countyStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { savePermit, patchPermit } from '@/services/firestore/permits';
import { calculateFees } from '@/services/fees/calculator';
import { generateChecklist } from '@/services/checklist/generator';
import type { PermitPacket, HomeType, ChecklistItemDefinition, ChecklistItemState, MobileHome, ModularHome, WindZone } from '@/types';

interface PermitWizardProps {
  /**
   * When provided, the wizard operates in "edit" mode: form fields are
   * pre-filled from the existing permit, and on submit we patch (not create).
   */
  existingPermit?: PermitPacket;
}

const APP_ID = import.meta.env.VITE_FIREBASE_APP_ID ?? 'local';

const STEPS = [
  { id: 1, label: 'Home Type' },
  { id: 2, label: 'Location' },
  { id: 3, label: 'Owner & Contractor' },
  { id: 4, label: 'Home Details' },
  { id: 5, label: 'Fees' },
  { id: 6, label: 'Checklist' },
];

type WizardFormValues = {
  siteAddress: string;
  parcelId: string;
  legalDescription: string;
  countyId: string;
  floodZone: string;
  elevationCertRequired: boolean;
  serialNumber: string;
  hudLabelNumber: string;
  installerLicenseNumber: string;
  installerName: string;
  windZoneRating: string;
  dbprLicenseNumber: string;
  maxFloorLoad: number | null;
  dataPlateManufacturer: string;
  thermalZone: string;
  year: number | null;
  make: string;
  model: string;
  owner: { name: string; address: string; city: string; state: string; zip: string; phone: string; email: string };
  contractor: { name: string; address: string; city: string; state: string; zip: string; phone: string; email: string };
};

const FLOOD_ZONE_OPTIONS = [
  { value: 'X', label: 'Zone X (Minimal)' },
  { value: 'AE', label: 'Zone AE (High Risk)' },
  { value: 'VE', label: 'Zone VE (Coastal)' },
  { value: 'A', label: 'Zone A' },
  { value: 'AH', label: 'Zone AH' },
  { value: 'AO', label: 'Zone AO' },
  { value: 'other', label: 'Other' },
];

function mapDefinitionsToChecklistState(definitions: ChecklistItemDefinition[]): ChecklistItemState[] {
  return definitions.map((d) => ({
    definitionId: d.id,
    label: d.label,
    completed: false,
    completedAt: null,
    notes: '',
  }));
}

export function PermitWizard({ existingPermit }: PermitWizardProps = {}) {
  const isEditMode = Boolean(existingPermit);

  const [step, setStep] = useState(1);
  const [homeType, setHomeType] = useState<HomeType | null>(existingPermit?.homeType ?? null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItemState[]>(
    existingPermit?.checklistItems ?? [],
  );
  const { addPermit, updatePermit } = usePermitStore();
  const { getCountyById } = useCountyStore();
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  /**
   * Pre-fill helper: when editing, pull values from the existing permit;
   * when creating, use blank defaults. The mobile/modular fields need a
   * type-guard because MobileHome and ModularHome have different shapes.
   */
  const mobileDefaults = existingPermit?.homeType === 'mobile'
    ? existingPermit.home as MobileHome
    : null;
  const modularDefaults = existingPermit?.homeType === 'modular'
    ? existingPermit.home as ModularHome
    : null;

  const { control, register, handleSubmit, watch, setValue } = useForm<WizardFormValues>({
    defaultValues: {
      siteAddress: existingPermit?.siteAddress ?? '',
      parcelId: existingPermit?.parcelId ?? '',
      legalDescription: existingPermit?.legalDescription ?? '',
      countyId: existingPermit?.countyId ?? '',
      floodZone: existingPermit?.floodZone ?? 'X',
      elevationCertRequired: existingPermit?.elevationCertRequired ?? false,
      serialNumber: existingPermit?.home.serialNumber ?? '',
      hudLabelNumber: mobileDefaults?.hudLabelNumber ?? '',
      installerLicenseNumber: mobileDefaults?.installerLicenseNumber ?? '',
      installerName: mobileDefaults?.installerName ?? '',
      windZoneRating: existingPermit?.home.windZoneRating ?? 'II',
      dbprLicenseNumber: modularDefaults?.dbprLicenseNumber ?? '',
      maxFloorLoad: modularDefaults?.dataPlateInfo.maxFloorLoad ?? null,
      dataPlateManufacturer: modularDefaults?.dataPlateInfo.manufacturer ?? '',
      thermalZone: modularDefaults?.dataPlateInfo.thermalZone ?? '',
      year: existingPermit?.home.year ?? null,
      make: existingPermit?.home.make ?? '',
      model: existingPermit?.home.model ?? '',
      owner: existingPermit?.owner ?? { name: '', address: '', city: '', state: 'FL', zip: '', phone: '', email: '' },
      contractor: existingPermit?.contractor ?? { name: '', address: '', city: '', state: 'FL', zip: '', phone: '', email: '' },
    },
  });

  const countyId = watch('countyId');

  const handleCountyChange = (id: string) => {
    setValue('countyId', id);
    if (homeType) {
      setChecklistItems(mapDefinitionsToChecklistState(generateChecklist(id, homeType)));
    }
  };

  const handleHomeTypeChange = (type: HomeType) => {
    setHomeType(type);
    if (countyId) {
      setChecklistItems(mapDefinitionsToChecklistState(generateChecklist(countyId, type)));
    }
  };

  const toggleChecklistItem = (definitionId: string) => {
    setChecklistItems(items => items.map(item =>
      item.definitionId === definitionId
        ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date() : null }
        : item,
    ));
  };

  const onSubmit = async (data: WizardFormValues) => {
    const c = data.countyId ? getCountyById(data.countyId) : undefined;
    const windZoneRequired: WindZone = c ? c.windZone : (data.windZoneRating as WindZone) ?? 'II';

    const homeBase = {
      homeType: homeType!,
      year: data.year,
      make: data.make,
      model: data.model,
      serialNumber: data.serialNumber,
      propertyClassification: 'personal' as const,
      windZoneRating: (data.windZoneRating as WindZone) ?? 'II',
    };

    const home: MobileHome | ModularHome = homeType === 'mobile'
      ? { ...homeBase, homeType: 'mobile', hudLabelNumber: data.hudLabelNumber, installerLicenseNumber: data.installerLicenseNumber, installerName: data.installerName, anchorPattern: '', blockingChartRef: '' }
      : { ...homeBase, homeType: 'modular', dbprLicenseNumber: data.dbprLicenseNumber, foundationPlanRef: '', dataPlateInfo: { manufacturer: data.dataPlateManufacturer, maxFloorLoad: data.maxFloorLoad, thermalZone: data.thermalZone } };

    const userId = user?.id ?? 'local-user';
    const fees = calculateFees(data.countyId, homeType!);

    if (isEditMode && existingPermit) {
      /* ── Edit mode: patch the existing permit ── */
      const changes: Partial<PermitPacket> = {
        homeType: homeType!,
        home,
        countyId: data.countyId,
        countyName: c?.name ?? '',
        siteAddress: data.siteAddress,
        parcelId: data.parcelId,
        legalDescription: data.legalDescription,
        windZoneRequired,
        floodZone: data.floodZone as PermitPacket['floodZone'],
        elevationCertRequired: data.elevationCertRequired,
        owner: data.owner,
        contractor: data.contractor,
        fees,
        checklistItems,
        ownerId: existingPermit.ownerId ?? userId,
        sharedWith: existingPermit.sharedWith ?? [],
        updatedAt: new Date(),
      };

      updatePermit(existingPermit.id, changes);

      try {
        await patchPermit(APP_ID, userId, existingPermit.id, changes);
        showSuccess('All changes saved to cloud.', 'Permit Updated');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save changes to cloud';
        showError(message, 'Firestore Error');
      }

      navigate(`/permits/${existingPermit.id}`);
    } else {
      /* ── Create mode: build a brand-new permit ── */
      const permit: PermitPacket = {
        id: crypto.randomUUID(),
        userId,
        ownerId: userId,
        sharedWith: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'draft',
        homeType: homeType!,
        home,
        countyId: data.countyId,
        countyName: c?.name ?? '',
        siteAddress: data.siteAddress,
        parcelId: data.parcelId,
        legalDescription: data.legalDescription,
        windZoneRequired,
        floodZone: data.floodZone as PermitPacket['floodZone'],
        elevationCertRequired: data.elevationCertRequired,
        owner: data.owner,
        contractor: data.contractor,
        fees,
        documents: [],
        checklistItems,
        lastPreFlightScan: null,
        notes: '',
      };

      addPermit(permit);

      try {
        await savePermit(APP_ID, userId, permit);
        showSuccess('Permit packet created and saved to cloud.', 'Permit Created');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save permit to cloud';
        showError(message, 'Firestore Error');
      }

      navigate('/');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicator — wraps on very small screens, connectors flex to fill */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-y-2 sm:justify-start">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${step > s.id ? 'bg-green-500 text-white' : step === s.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
              {step > s.id ? <Check size={14} /> : s.id}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-1 h-0.5 w-4 sm:w-8 ${step > s.id ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">{STEPS[step - 1].label}</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {step === 1 && <HomeTypeSelector value={homeType} onChange={handleHomeTypeChange} />}

          {step === 2 && (
            <div className="space-y-4">
              <Input label="Site Address" {...register('siteAddress')} placeholder="123 Main St" />
              <Input label="Parcel ID" {...register('parcelId')} placeholder="00-0000-000-0000" />
              <Input label="Legal Description" {...register('legalDescription')} placeholder="Lot 1, Block 2..." />
              <CountySelector value={countyId} onChange={handleCountyChange} />
              <Select label="Flood Zone" options={FLOOD_ZONE_OPTIONS} {...register('floodZone')} />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('elevationCertRequired')} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Elevation Certificate Required</span>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <OwnerInfoForm control={control as unknown as Control<FieldValues>} prefix="owner" title="Property Owner" />
              <OwnerInfoForm control={control as unknown as Control<FieldValues>} prefix="contractor" title="Contractor / Installer" />
            </div>
          )}

          {step === 4 && homeType === 'mobile' && <MobileHomeFields control={control as unknown as Control<FieldValues>} />}
          {step === 4 && homeType === 'modular' && <ModularHomeFields control={control as unknown as Control<FieldValues>} />}
          {step === 4 && !homeType && <p className="text-sm text-gray-500">Please select a home type in Step 1.</p>}

          {step === 5 && homeType && (
            <FinancialSummary countyId={countyId} homeType={homeType} />
          )}
          {step === 5 && !homeType && (
            <p className="text-sm text-gray-500">Please select a home type in Step 1.</p>
          )}

          {step === 6 && (
            checklistItems.length > 0
              ? <DynamicChecklist items={checklistItems} onToggle={toggleChecklistItem} />
              : <p className="text-sm text-gray-400 italic">Select a county in Step 2 to load checklist items.</p>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-5 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={() => setStep(s => Math.max(s - 1, 1))} disabled={step === 1}>
              <ChevronLeft size={16} className="mr-1" /> Back
            </Button>
            {step < STEPS.length ? (
              <Button type="button" onClick={() => setStep(s => s + 1)} disabled={step === 1 && !homeType}>
                Next <ChevronRight size={16} className="ml-1" />
              </Button>
            ) : (
              <Button type="submit">
                <Check size={16} className="mr-1" /> {isEditMode ? 'Save Changes' : 'Create Permit'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
