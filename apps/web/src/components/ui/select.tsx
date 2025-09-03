'use client';

import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

type Option = {
  label: string;
  value: string;
};

interface SelectProps {
  options: Option[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function UiSelect({ options, placeholder, value, onChange }: SelectProps) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="inline-flex w-[200px] items-center justify-between rounded-md border px-3 py-2 text-sm shadow-sm hover:bg-gray-50">
        <Select.Value placeholder={placeholder || 'Selecciona una opción'} />
        <Select.Icon>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="z-50 rounded-md border bg-white shadow-md">
          <Select.Viewport className="p-1">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="relative flex cursor-pointer items-center rounded-sm px-8 py-2 text-sm hover:bg-gray-100"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute left-2">
                  <Check className="h-4 w-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
