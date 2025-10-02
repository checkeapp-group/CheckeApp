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
    <Select.Root onValueChange={onChange} value={value}>
      <Select.Trigger className="inline-flex w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground">
        <Select.Value placeholder={placeholder || 'Selecciona una opción'} />
        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="z-50 rounded-md border border-input bg-popover text-popover-foreground shadow-md">
          <Select.Viewport className="p-1">
            {options.map((opt) => (
              <Select.Item
                className="relative flex cursor-pointer items-center rounded-sm px-8 py-2 text-sm text-foreground outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
                key={opt.value}
                value={opt.value}
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute left-2">
                  <Check className="h-4 w-4 text-primary" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}