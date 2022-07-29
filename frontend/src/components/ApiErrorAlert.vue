<script setup lang="ts">
import { ApiErrorResponse } from '@/api';

defineProps<{
  error: ApiErrorResponse;
}>();
</script>

<template>
  <v-alert density="compact" type="error" v-for="(e, index) in error.errors" :key="`error-${index}`">
    <v-alert-title>{{ e.code }} {{ e.title }}</v-alert-title>
    {{ e.detail }}
  </v-alert>
</template>
