import { LocaleKey, availableLocales } from '@/core/i18n';
import { defineStore } from 'pinia';

type SettingsState = {
  locale: LocaleKey;
};

export const useSettingsStore = defineStore('settings', {
  persist: true,
  state: (): SettingsState => ({
    locale: availableLocales.find((locale) => navigator.language.startsWith(locale)) ?? availableLocales[0],
  }),
  actions: {},
});
