<script setup lang="ts">
import { DeepReadonly } from 'vue';
import { ApiErrorResponse } from '@/api';

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
