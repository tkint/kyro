<script setup lang="ts">
import TheDrawer from '@/components/layout/TheDrawer.vue';
import TheHeader from '@/components/layout/TheHeader.vue';
import { LocaleKey } from '@/core/i18n';
import { useAuthStore } from '@/stores/auth';
import { useSettingsStore } from '@/stores/settings';
import LoginView from '@/views/LoginView.vue';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

const authStore = useAuthStore();
const settingsStore = useSettingsStore();

locale.value = settingsStore.locale;

watch(locale, (newValue) => {
  settingsStore.$patch({ locale: newValue as LocaleKey });
});

const showDrawer = ref(true);
</script>

<template>
  <v-app>
    <template v-if="authStore.isLogged">
      <the-header @toggle-drawer="showDrawer = !showDrawer"></the-header>
      <the-drawer v-model:visible="showDrawer"></the-drawer>
      <v-main>
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component"></component>
          </keep-alive>
        </router-view>
      </v-main>
    </template>
    <login-view v-else></login-view>
  </v-app>
</template>

<style></style>
