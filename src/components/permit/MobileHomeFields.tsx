import { Controller, type Control, type FieldValues } from 'react-hook-form';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import { LatexBlock } from '@/components/shared/LatexBlock';

const windZoneOptions = [
  { value: 'I', label: 'Wind Zone I' },
  { value: 'II', label: 'Wind Zone II' },
  { value: 'III', label: 'Wind Zone III' },
];

export function MobileHomeFields({ control }: { control: Control<FieldValues> }) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
        <p className="font-medium">HUD Code Requirements</p>
        <p className="mt-1 opacity-80">Mobile homes must comply with HUD standards. Minimum roof load: <LatexBlock expression="20\text{ lbs/ft}^2" /> (live load). Wind resistance per zone rating required.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller name="serialNumber" control={control} defaultValue=""
          render={({ field }) => <Input {...field} label="Serial Number / VIN" placeholder="ABC123456789" />} />
        <Controller name="hudLabelNumber" control={control} defaultValue=""
          render={({ field }) => <Input {...field} label="HUD Label Number" placeholder="HUD-000000" />} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Controller name="year" control={control} defaultValue={null}
          render={({ field }) => <Input {...field} label="Year" type="number" placeholder="2024" value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || null)} />} />
        <Controller name="make" control={control} defaultValue=""
          render={({ field }) => <Input {...field} label="Make / Manufacturer" placeholder="Clayton" />} />
        <Controller name="model" control={control} defaultValue=""
          render={({ field }) => <Input {...field} label="Model" placeholder="Freedom" />} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller name="windZoneRating" control={control} defaultValue="II"
          render={({ field }) => <Select {...field} label="Wind Zone Rating (Home)" options={windZoneOptions} placeholder="Select wind zone..." />} />
        <Controller name="installerLicenseNumber" control={control} defaultValue=""
          render={({ field }) => <Input {...field} label="Installer License (IH#)" placeholder="IH12345" />} />
      </div>
      <Controller name="installerName" control={control} defaultValue=""
        render={({ field }) => <Input {...field} label="Installer / Contractor Name" />} />
    </div>
  );
}
