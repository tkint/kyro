<script setup lang="ts">
import { ref } from 'vue';
import TheDrawer from '@/components/layout/TheDrawer.vue';
import TheHeader from '@/components/layout/TheHeader.vue';
import { useAuthStore } from '@/stores/auth';
import LoginView from '@/views/LoginView.vue';

const authStore = useAuthStore();

const compactDrawer = ref(false);
</script>

<template>
  <v-app>
    <template v-if="authStore.isLogged">
      <the-header @toggle-drawer="compactDrawer = !compactDrawer"></the-header>
      <the-drawer v-model:compact="compactDrawer"></the-drawer>
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
