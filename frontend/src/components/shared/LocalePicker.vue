<script setup lang="ts">
import { LocaleKey, availableLocales, localeOptions } from '@/core/i18n';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { VMenu } from 'vuetify/lib/components/index.mjs';

defineProps<{
  location?: VMenu['location'];
}>();

const { locale } = useI18n();

const currentLocale = computed<LocaleKey>({
  get: () => locale.value as LocaleKey,
  set: (newValue) => {
    locale.value = newValue;
  },
});
</script>

<template>
  <v-menu :location="location" eager>
    <template v-slot:activator="{ props }">
      <slot name="activator" :props="props" :options="localeOptions[currentLocale]">
        <v-btn v-bind="props" flat>
          <component :is="localeOptions[currentLocale].flag" style="width: 23px"></component>
          <span class="ms-2">{{ localeOptions[currentLocale].name }}</span>
        </v-btn>
      </slot>
    </template>

    <v-list density="compact">
      <v-list-item
        density="compact"
        variant="flat"
        v-for="locale in availableLocales.filter((l) => l !== currentLocale)"
        :key="`locale-${locale}`"
        @click="currentLocale = locale">
        <v-row dense>
          <v-col cols="auto" class="mt-1 me-0">
            <component :is="localeOptions[locale].flag" style="width: 23px"></component>
          </v-col>
          <v-col class="ms-0 text-uppercase">{{ localeOptions[locale].name }}</v-col>
        </v-row>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
