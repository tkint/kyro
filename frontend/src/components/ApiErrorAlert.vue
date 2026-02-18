<script setup lang="ts">
import { ApiErrorResponse } from '@/api';
import { computed, DeepReadonly, ref, watch } from 'vue';

const props = defineProps<{
  error: ApiErrorResponse | DeepReadonly<ApiErrorResponse>;
}>();

const dismissed = ref<Set<string>>(new Set());
const errorKey = (error: ApiErrorResponse['errors'][number]) => `${error.code}|${error.title}|${error.detail}`;

watch(
  () => props.error.errors,
  (errors) => {
    const existingKeys = new Set(errors.map(errorKey));
    dismissed.value = new Set([...dismissed.value].filter((key) => existingKeys.has(key)));
  },
  { deep: true, immediate: true },
);

const visibleErrors = computed(() => props.error.errors.filter((error) => !dismissed.value.has(errorKey(error))));
const dismiss = (error: ApiErrorResponse['errors'][number]) => {
  dismissed.value.add(errorKey(error));
};
</script>

<template>
  <v-alert
    density="compact"
    type="error"
    closable
    v-for="(e, index) in visibleErrors"
    :key="`error-${index}`"
    @click:close="dismiss(e)">
    <v-alert-title>{{ e.code }} {{ e.title }}</v-alert-title>
    {{ e.detail }}
  </v-alert>
</template>
