import { Controller, type Control, type FieldValues } from 'react-hook-form';
import { Input } from '@/components/shared/Input';

interface OwnerInfoFormProps {
  control: Control<FieldValues>;
  prefix: string;
  title: string;
}

export function OwnerInfoForm({ control, prefix, title }: OwnerInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller name={`${prefix}.name`} control={control} defaultValue=""
          render={({ field }) => <Input {...field} label="Full Name" />} />
        <Controller name={`${prefix}.phone`} control={control} defaultValue=""
          render={({ field }) => <Input {...field} label="Phone" type="tel" />} />
      </div>
      <Controller name={`${prefix}.email`} control={control} defaultValue=""
        render={({ field }) => <Input {...field} label="Email" type="email" />} />
      <Controller name={`${prefix}.address`} control={control} defaultValue=""
        render={({ field }) => <Input {...field} label="Address" />} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Controller name={`${prefix}.city`} control={control} defaultValue=""
          render={({ field }) => <Input {...field} label="City" />} />
        <Controller name={`${prefix}.state`} control={control} defaultValue="FL"
          render={({ field }) => <Input {...field} label="State" />} />
        <Controller name={`${prefix}.zip`} control={control} defaultValue=""
          render={({ field }) => <Input {...field} label="ZIP Code" />} />
      </div>
    </div>
  );
}
