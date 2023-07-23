<script setup lang="ts">
import { ApiErrorResponse } from '@/api';
import { DeepReadonly } from 'vue';

defineProps<{
  error: ApiErrorResponse | DeepReadonly<ApiErrorResponse>;
}>();
</script>

<template>
  <v-alert density="compact" type="error" v-for="(e, index) in error.errors" :key="`error-${index}`">
    <v-alert-title>{{ e.code }} {{ e.title }}</v-alert-title>
    {{ e.detail }}
  </v-alert>
</template>
