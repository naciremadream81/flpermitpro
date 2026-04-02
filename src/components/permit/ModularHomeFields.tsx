import { Controller, type Control, type FieldValues } from 'react-hook-form';
import { Input } from '@/components/shared/Input';
import { Select } from '@/components/shared/Select';
import { LatexBlock } from '@/components/shared/LatexBlock';

const windZoneOptions = [
  { value: 'I', label: 'Wind Zone I' },
  { value: 'II', label: 'Wind Zone II' },
  { value: 'III', label: 'Wind Zone III' },
];

export function ModularHomeFields({ control }: { control: Control<FieldValues> }) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-sm text-purple-800 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
        <p className="font-medium">Florida Building Code Requirements</p>
        <p className="mt-1 opacity-80">Modular homes must comply with the FBC. Floor live load minimum: <LatexBlock expression="40\text{ lbs/ft}^2" />. DBPR-licensed contractor required.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller name="serialNumber" control={control} defaultValue=""
          render={({ field }) => <Input {...field} label="Serial Number" placeholder="MOD-123456" />} />
        <Controller name="dbprLicenseNumber" control={control} defaultValue=""
          render={({ field }) => <Input {...field} label="DBPR License Number" placeholder="CBC1234567" />} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Controller name="year" control={control} defaultValue={null}
          render={({ field }) => <Input {...field} label="Year" type="number" placeholder="2024" value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || null)} />} />
        <Controller name="make" control={control} defaultValue=""
          render={({ field }) => <Input {...field} label="Manufacturer" placeholder="Palm Harbor" />} />
        <Controller name="model" control={control} defaultValue=""
          render={({ field }) => <Input {...field} label="Model" placeholder="DreamBuilder" />} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller name="windZoneRating" control={control} defaultValue="II"
          render={({ field }) => <Select {...field} label="Wind Zone Rating (Home)" options={windZoneOptions} placeholder="Select wind zone..." />} />
        <Controller name="maxFloorLoad" control={control} defaultValue={null}
          render={({ field }) => (
            <Input {...field} label="Max Floor Load (PSF)" type="number" placeholder="40" hint="From Data Plate — min 40 lbs/ft² per FBC"
              value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || null)} />
          )} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller name="dataPlateManufacturer" control={control} defaultValue=""
          render={({ field }) => <Input {...field} label="Data Plate Manufacturer" />} />
        <Controller name="thermalZone" control={control} defaultValue=""
          render={({ field }) => <Input {...field} label="Thermal Zone" placeholder="Zone 2" />} />
      </div>
    </div>
  );
}
