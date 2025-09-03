'use client';

import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';

const languages = [
  {
    value: 'es',
    label: 'Español',
    shortLabel: 'ES',
    flag: '🇪🇸',
    ariaLabel: 'Español, España',
  },
  {
    value: 'eu',
    label: 'Euskera',
    shortLabel: 'EU',
    flag: '🇪🇺',
    ariaLabel: 'Euskera, País Vasco',
  },
  {
    value: 'ca',
    label: 'Català',
    shortLabel: 'CA',
    flag: '🇪🇸',
    ariaLabel: 'Catalán, España',
  },
  {
    value: 'gl',
    label: 'Galego',
    shortLabel: 'GL',
    flag: '🇪🇸',
    ariaLabel: 'Gallego, España',
  },
];

export function LanguageSelector() {
  const { locale, setLocale } = useI18n();

  const currentLanguage = languages.find((lang) => lang.value === locale);

  return (
    <Select.Root aria-label="Selector de idioma" onValueChange={setLocale} value={locale}>
      <Select.Trigger
        aria-label={`Idioma actual: ${currentLanguage?.label || 'No seleccionado'}. Presiona Enter o Espacio para cambiar idioma`}
        className="inline-flex w-full min-w-0 max-w-[200px] items-center justify-between rounded-md border px-3 py-2 text-xs shadow-sm transition-all duration-200 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[state=open]:ring-2 data-[state=open]:ring-blue-500 sm:w-[160px] sm:text-sm md:w-[180px] lg:w-[200px]"
      >
        <Select.Value
          placeholder={
            <span className="truncate text-gray-500">
              <span className="hidden sm:inline">Selecciona idioma...</span>
              <span className="sm:hidden">Idioma...</span>
            </span>
          }
        >
          {currentLanguage && (
            <span className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <span aria-hidden="true" className="flex-shrink-0 text-sm sm:text-base">
                {currentLanguage.flag}
              </span>
              <span className="hidden truncate sm:inline">{currentLanguage.label}</span>
              <span className="truncate font-medium text-xs sm:hidden">
                {currentLanguage.shortLabel}
              </span>
            </span>
          )}
        </Select.Value>
        <Select.Icon aria-hidden="true" className="ml-1 flex-shrink-0">
          <ChevronDown className="h-3 w-3 opacity-70 sm:h-4 sm:w-4" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          aria-label="Opciones de idioma disponibles"
          avoidCollisions={true}
          className="z-50 min-w-[140px] max-w-[90vw] rounded-md border bg-white shadow-lg will-change-[opacity,transform] sm:min-w-[160px] sm:max-w-none md:min-w-[200px]"
          position="popper"
          side="bottom"
          sideOffset={4}
          collisionPadding={8}
          role="listbox"
        >
          <Select.Viewport className="max-h-[250px] overflow-y-auto p-1.5 sm:max-h-[300px] sm:p-2">
            {languages.map((lang) => (
              <Select.Item
                aria-label={lang.ariaLabel}
                aria-selected={locale === lang.value}
                key={lang.value}
                value={lang.value}
                className="relative flex min-h-[36px] cursor-pointer touch-manipulation items-center rounded-sm px-6 py-2 text-xs transition-colors duration-150 ease-in-out hover:bg-gray-100 focus:bg-blue-100 focus:outline-none data-[highlighted]:bg-blue-100 data-[state=checked]:bg-blue-50 sm:min-h-[40px] sm:px-8 sm:py-2.5 sm:text-sm"
              >
                <Select.ItemText className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                  <span
                    aria-hidden="true"
                    role="img"
                    aria-label={`Bandera de ${lang.label}`}
                    className="flex-shrink-0 text-sm sm:text-base"
                  >
                    {lang.flag}
                  </span>
                  <span className="truncate font-medium">{lang.label}</span>
                  <span className="ml-auto flex-shrink-0 text-gray-500 text-xs sm:hidden">
                    {lang.shortLabel}
                  </span>
                </Select.ItemText>
                <Select.ItemIndicator className="absolute left-1 sm:left-2">
                  <Check aria-hidden="true" className="h-3 w-3 sm:h-4 sm:w-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}