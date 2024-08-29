<script setup lang="ts">
import { RouteNames } from '@/core/router';
import { useAuthStore } from '@/stores/auth';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouteLocationRaw, useRouter } from 'vue-router';
import { useDisplay } from 'vuetify/lib/framework.mjs';

type MenuItem = {
  label: string;
  route: RouteLocationRaw;
  icon: string;
};

const visible = defineModel<boolean>('visible');

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const display = useDisplay();

const compact = computed(() => {
  if (display.mdAndUp.value) {
    return !visible.value;
  }
  return true;
});

const menus = computed<MenuItem[]>(() => [
  { label: t('menu.applications'), route: { name: RouteNames.APPLICATIONS }, icon: 'mdi-view-dashboard' },
  { label: t('menu.organizations'), route: { name: RouteNames.ORGANIZATIONS }, icon: 'mdi-file-tree-outline' },
]);

const logout = () => {
  authStore.$reset();
  router.push({ name: RouteNames.HOME });
};
</script>

<template>
  <v-navigation-drawer permanent :rail="compact" color="grey-lighten-3" :model-value="visible || display.mdAndUp.value">
    <v-list color="primary" bg-color="transparent">
      <v-tooltip
        location="right"
        v-for="(menu, index) in menus"
        :key="`menu-${index}`"
        :text="menu.label"
        content-class="k-opacity-100">
        <template #activator="{ props }">
          <v-list-item :to="menu.route" :prepend-icon="menu.icon" v-bind="compact ? props : undefined">
            <template v-if="!compact">{{ menu.label }}</template>
          </v-list-item>
        </template>
      </v-tooltip>
    </v-list>

    <template #append>
      <v-list color="primary" bg-color="transparent" v-if="compact">
        <v-list-item>
          <v-icon>mdi-account</v-icon>
          <v-tooltip activator="parent" location="right">
            <div>{{ authStore.decodedToken?.user_name }}</div>
            <div>{{ authStore.decodedToken?.email }}</div>
          </v-tooltip>
        </v-list-item>

        <v-list-item @click="logout">
          <v-icon>mdi-logout</v-icon>
          <v-tooltip activator="parent" location="right">{{ t('auth.logout') }}</v-tooltip>
        </v-list-item>
      </v-list>

      <div class="pa-2" v-else>
        <v-card tile>
          <v-card-title>
            {{ authStore.decodedToken?.user_name }}
          </v-card-title>

          <v-card-subtitle>
            {{ authStore.decodedToken?.email }}
          </v-card-subtitle>

          <v-card-text class="pa-1">
            <v-btn @click="logout" prepend-icon="mdi-logout" class="justify-start" flat block>
              {{ t('auth.logout') }}
            </v-btn>
          </v-card-text>
        </v-card>
      </div>
    </template>
  </v-navigation-drawer>
</template>
