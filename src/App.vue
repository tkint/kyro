<script setup lang="ts">
import { ref } from 'vue';
import TheDrawer from '@/components/layout/TheDrawer.vue';
import TheHeader from '@/components/layout/TheHeader.vue';
import { componentNameFor, RouteNames } from '@/router';
import { useAuthStore } from '@/stores/auth';
import LoginView from '@/views/LoginView.vue';

const authStore = useAuthStore();

const showDrawer = ref(true);

const cachedViews: string[] = [
  RouteNames.APPLICATIONS,
  RouteNames.APPLICATION,
  RouteNames.ORGANIZATION,
  RouteNames.SPACE,
].map((route) => componentNameFor(route));
</script>

<template>
  <v-app>
    <template v-if="authStore.isLogged">
      <the-header @toggle-drawer="showDrawer = !showDrawer"></the-header>
      <the-drawer v-model:show="showDrawer"></the-drawer>
      <v-main>
        <router-view v-slot="{ Component }">
          <keep-alive :include="cachedViews">
            <component :is="Component"></component>
          </keep-alive>
        </router-view>
      </v-main>
    </template>
    <login-view v-else></login-view>
  </v-app>
</template>

<style></style>
