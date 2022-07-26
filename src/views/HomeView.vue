<script setup lang="ts">
import { buildApiResponseWithError } from '@/api';
import userApi from '@/api/user';
import useLoadData from '@/composables/useLoadData';
import { onCachedActivated } from '@/hooks';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const { data, loadData, error, loading, resetData } = useLoadData(() => userApi.getOne(authStore.decodedToken.user_id));

onCachedActivated(
  () => authStore.authToken,
  (invalidate) => {
    if (invalidate) {
      resetData();
    }
    loadData();
  },
);
</script>

<template>
  <v-container fluid>
    {{ data }}
  </v-container>
</template>
