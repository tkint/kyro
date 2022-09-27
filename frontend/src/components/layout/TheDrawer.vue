<script setup lang="ts">
import { computed } from 'vue';
import { RouteLocationRaw, useRouter } from 'vue-router';
import { RouteNames } from '@/router';
import { useAuthStore } from '@/stores/auth';

type MenuItem = {
  label: string;
  route: RouteLocationRaw;
  icon: string;
};

const props = defineProps<{
  compact: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:compact', newValue: boolean): void;
}>();

const router = useRouter();
const authStore = useAuthStore();

const localCompact = computed({
  get: () => props.compact,
  set: (newValue) => emits('update:compact', newValue),
});

const menus: MenuItem[] = [
  { label: 'Applications', route: { name: RouteNames.APPLICATIONS }, icon: 'mdi-view-dashboard' },
  { label: 'Organisations', route: { name: RouteNames.ORGANIZATIONS }, icon: 'mdi-file-tree-outline' },
];

const logout = () => {
  authStore.$reset();
  router.push({ name: RouteNames.HOME });
};
</script>

<template>
  <v-navigation-drawer :rail="localCompact" color="grey-lighten-3">
    <v-list color="primary" bg-color="transparent">
      <v-tooltip
        location="right"
        v-for="(menu, index) in menus"
        :key="`menu-${index}`"
        :text="menu.label"
        content-class="k-opacity-100">
        <template #activator="{ props }">
          <v-list-item :to="menu.route" :prepend-icon="menu.icon" v-bind="localCompact ? props : undefined">
            <template v-if="!localCompact">{{ menu.label }}</template>
          </v-list-item>
        </template>
      </v-tooltip>
    </v-list>

    <template #append>
      <v-list color="primary" bg-color="transparent" v-if="localCompact" style="opacity: 0.6">
        <v-list-item>
          <v-icon>mdi-account</v-icon>
          <v-tooltip activator="parent" location="right">
            <div>{{ authStore.decodedToken?.user_name }}</div>
            <div>{{ authStore.decodedToken?.email }}</div>
          </v-tooltip>
        </v-list-item>

        <v-list-item @click="logout">
          <v-icon>mdi-logout</v-icon>
          <v-tooltip activator="parent" location="right">Déconnexion</v-tooltip>
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

          <v-card-actions>
            <v-btn block @click="logout" prepend-icon="mdi-logout">Déconnexion</v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </template>
  </v-navigation-drawer>
</template>
