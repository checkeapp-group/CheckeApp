"use client";

import * as Select from "@radix-ui/react-select";

import {Check, ChevronDown} from "lucide-react";

import {useI18n} from "@/hooks/use-i18n";

const languages = [
    {
        value: "es",
        label: "Español",
        shortLabel: "ES",
        flag: "🇪🇸",
        ariaLabel: "Español, España",
    },
    {
        value: "eu",
        label: "Euskera",
        shortLabel: "EU",
        flag: "🇪🇺",
        ariaLabel: "Euskera, País Vasco",
    },
    {
        value: "ca",
        label: "Català",
        shortLabel: "CA",
        flag: "🇪🇸",
        ariaLabel: "Catalán, España",
    },
    {
        value: "gl",
        label: "Galego",
        shortLabel: "GL",
        flag: "🇪🇸",
        ariaLabel: "Gallego, España",
    },
];

export function LanguageSelector() {
    const {locale, setLocale} = useI18n();

    const currentLanguage = languages.find((lang) => lang.value === locale);

    return (
        <Select.Root
            aria-label="Selector de idioma"
            onValueChange={setLocale}
            value={locale}>
            <Select.Trigger
                aria-label={`Idioma actual: ${
                    currentLanguage?.label || "No seleccionado"
                }. Presiona Enter o Espacio para cambiar idioma`}
                className="inline-flex min-h-[44px] w-full min-w-0 max-w-[100px] items-center justify-between rounded-md border-2 border-gray-300 bg-white px-3 py-3 font-medium text-gray-900 text-sm shadow-sm transition-all duration-200 ease-in-out hover:border-gray-400 hover:bg-gray-50 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 data-[state=open]:border-teal-500 data-[state=open]:ring-2 data-[state=open]:ring-teal-500 sm:w-[160px] md:w-[180px] lg:w-[200px]">
                <Select.Value
                    placeholder={
                        <span className="truncate font-medium text-gray-700">
                            <span className="hidden sm:inline">
                                Selecciona idioma...
                            </span>
                            <span className="sm:hidden">Idioma...</span>
                        </span>
                    }>
                    {currentLanguage && (
                        <span className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                            {/* <span
                                aria-hidden="true"
                                className="flex-shrink-0 text-sm sm:text-base">
                                {currentLanguage.flag}
                            </span> */}
                            <span className="hidden truncate sm:inline">
                                {currentLanguage.label}
                            </span>
                            <span className="truncate font-bold text-gray-900 text-sm sm:hidden">
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
                    className="z-50 min-w-[100px] max-w-[90vw] rounded-md border-2 border-gray-300 bg-white shadow-lg will-change-[opacity,transform] sm:max-w-none"
                    collisionPadding={8}
                    position="popper"
                    role="listbox"
                    side="bottom"
                    sideOffset={4}>
                    <Select.Viewport className="max-h-[250px] overflow-y-auto p-1.5 sm:max-h-[300px] sm:p-2">
                        {languages.map((lang) => (
                            <Select.Item
                                aria-label={lang.ariaLabel}
                                aria-selected={locale === lang.value}
                                className="relative flex min-h-[44px] cursor-pointer touch-manipulation items-center rounded-sm px-6 py-3 font-medium text-gray-900 text-sm transition-colors duration-150 ease-in-out hover:bg-gray-100 focus:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset data-[highlighted]:bg-teal-50 data-[state=checked]:bg-teal-100 data-[highlighted]:ring-2 data-[highlighted]:ring-teal-500 data-[state=checked]:ring-2 data-[state=checked]:ring-teal-500 data-[highlighted]:ring-inset data-[state=checked]:ring-inset sm:min-h-[48px] sm:px-8 sm:py-3.5"
                                key={lang.value}
                                value={lang.value}>
                                <Select.ItemText className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                                    {/* <span
                                        aria-hidden="true"
                                        aria-label={`Bandera de ${lang.label}`}
                                        className="flex-shrink-0 text-sm sm:text-base"
                                        role="img">
                                        {lang.flag}
                                    </span> */}
                                    <span className="truncate font-medium">
                                        {lang.label}
                                    </span>
                                    <span className="ml-auto flex-shrink-0 font-medium text-gray-600 text-sm sm:hidden">
                                        {lang.shortLabel}
                                    </span>
                                </Select.ItemText>
                                <Select.ItemIndicator className="absolute left-1 sm:left-2">
                                    <Check
                                        aria-hidden="true"
                                        className="h-3 w-3 sm:h-4 sm:w-4"
                                    />
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}
