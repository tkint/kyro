import { mapValues } from 'lodash';
import { Component, defineAsyncComponent } from 'vue';
import { createI18n } from 'vue-i18n';

type LocaleOptions = {
  name: string;
  flag: Component;
};

export const localeOptions = {
  en: {
    name: 'English',
    flag: defineAsyncComponent(() => import('@/assets/flags/gb.svg')),
  },
  fr: {
    name: 'Français',
    flag: defineAsyncComponent(() => import('@/assets/flags/fr.svg')),
  },
} as const satisfies Record<string, LocaleOptions>;

export type Locales = typeof localeOptions;
export type LocaleKey = keyof Locales;

export const availableLocales = Object.keys(localeOptions) as LocaleKey[];
const defaultLocale = availableLocales[0];

const messages = mapValues(localeOptions, () => ({} as any));
Object.entries(import.meta.glob('../locales/*/*.json', { eager: true })).forEach(([filename, module]) => {
  const filenameParts = filename.split('/');
  const lang = filenameParts[filenameParts.length - 2] as LocaleKey;
  const key = filenameParts[filenameParts.length - 1].split('.')[0];
  messages[lang][key] = (module as any).default;
});

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  availableLocales,
  messages,
});

export default i18n;
