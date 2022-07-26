<script setup lang="ts">
import { computed } from 'vue';
import { RouteLocationRaw, useRouter } from 'vue-router';
import { RouteNames } from '@/router';
import { useAuthStore } from '@/stores/auth';

type MenuItem = {
  label: string;
  route: RouteLocationRaw;
};

const props = defineProps<{
  show: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:show', newValue: boolean): void;
}>();

const router = useRouter();
const authStore = useAuthStore();

const localSHow = computed({
  get: () => props.show,
  set: (newValue) => emits('update:show', newValue),
});

const menus: MenuItem[] = [
  { label: 'Home', route: { name: RouteNames.HOME } },
  { label: 'Applications', route: { name: RouteNames.APPLICATIONS } },
  { label: 'Organisations', route: { name: RouteNames.ORGANIZATIONS } },
];

const logout = () => {
  authStore.$reset();
  router.push({ name: RouteNames.HOME });
};
</script>

<template>
  <v-navigation-drawer app v-model="localSHow" color="grey-lighten-3">
    <v-list color="primary" bg-color="transparent">
      <v-list-item :to="menu.route" v-for="(menu, index) in menus" :key="`menu-${index}`">{{ menu.label }}</v-list-item>
    </v-list>

    <template #append>
      <div class="pa-2">
        <v-card tile>
          <v-card-title>
            {{ authStore.decodedToken?.user_name }}
          </v-card-title>

          <v-card-subtitle>
            {{ authStore.decodedToken?.email }}
          </v-card-subtitle>

          <v-card-actions>
            <v-btn block @click="logout">Déconnexion</v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </template>
  </v-navigation-drawer>
</template>
