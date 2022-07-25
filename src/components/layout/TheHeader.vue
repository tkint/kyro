<script setup lang="ts">
import { RouteLocationRaw } from 'vue-router';
import { RouteNames } from '@/router';
import { useAuthStore } from '@/stores/auth';

type MenuItem = {
  label: string;
  route: RouteLocationRaw;
};

const emits = defineEmits<{
  (e: 'toggleDrawer'): void;
}>();

const authStore = useAuthStore();

const menus: MenuItem[] = [
  { label: 'Home', route: { name: RouteNames.HOME } },
  { label: 'Applications', route: { name: RouteNames.APPLICATIONS } },
  { label: 'Organisations', route: { name: RouteNames.ORGANIZATIONS } },
];
</script>

<template>
  <v-app-bar color="primary" app>
    <template #prepend>
      <v-app-bar-nav-icon @click="emits('toggleDrawer')"></v-app-bar-nav-icon>
    </template>

    <v-app-bar-title class="v-col-auto">Kyro</v-app-bar-title>

    <v-btn :to="menu.route" v-for="(menu, index) in menus" :key="`menu-${index}`">{{ menu.label }}</v-btn>

    <v-spacer></v-spacer>

    <template #append>
      <v-btn icon="mdi-dots-vertical" @click="authStore.$reset()">X</v-btn>
    </template>
  </v-app-bar>
</template>
