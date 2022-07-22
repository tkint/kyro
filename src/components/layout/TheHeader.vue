<script setup lang="ts">
import { RouteNames } from '@/router';
import { useAuthStore } from '@/stores/auth';

const emits = defineEmits<{
  (e: 'toggleDrawer'): void;
}>();

const authStore = useAuthStore();
</script>

<template>
  <v-app-bar color="primary" app>
    <template #prepend>
      <v-app-bar-nav-icon @click="emits('toggleDrawer')"></v-app-bar-nav-icon>
    </template>

    <v-app-bar-title class="v-col-auto">Kyro</v-app-bar-title>

    <v-btn :to="{ name: RouteNames.HOME }">Home</v-btn>
    <v-btn :to="{ name: RouteNames.APPLICATIONS }">Applications</v-btn>

    <v-spacer></v-spacer>

    <template #append>
      <v-btn icon="mdi-dots-vertical" @click="authStore.$reset()">X</v-btn>
    </template>
  </v-app-bar>
</template>
