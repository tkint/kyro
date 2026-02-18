<script setup lang="ts">
import useLoadingFn from '@/composables/useLoadingFn';
import applicationApi from '@/api/application';
import { ApiErrorResponse } from '@/api';
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue';
import { CFApplication } from '@/models/cf/application';
import { computed, ref } from 'vue';

const props = defineProps<{
  application: CFApplication;
  disabled?: boolean;
}>();

const emits = defineEmits<{
  (e: 'launched'): void;
  (e: 'completed'): void;
  (e: 'success'): void;
  (e: 'error', error: ApiErrorResponse): void;
}>();

const loading = ref(false);
const dialog = ref(false);
const isDisabled = computed(() => props.disabled || loading.value);
const wait = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs));

const { fn: confirmDelete } = useLoadingFn(async () => {
  emits('launched');

  const result = await applicationApi.delete(props.application.guid);
  if (result.success) {
    for (let i = 0; i < 20; i++) {
      const appResult = await applicationApi.getOne(props.application.guid);
      if (!appResult.success) {
        break;
      }
      await wait(1000);
    }
    dialog.value = false;
    emits('success');
  } else {
    emits('error', result.error);
  }

  emits('completed');
}, loading);
</script>

<template>
  <v-btn @click="dialog = true" :loading="loading" :disabled="isDisabled">
    <v-icon>mdi-delete-outline</v-icon>
    <v-tooltip activator="parent" location="bottom">Delete</v-tooltip>
  </v-btn>

  <confirm-dialog v-model="dialog" @confirm="confirmDelete" :loading="loading">
    <template #text>
      Delete application `{{ application.name }}`?
    </template>
  </confirm-dialog>
</template>
