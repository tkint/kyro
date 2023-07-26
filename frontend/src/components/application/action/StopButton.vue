<script setup lang="ts">
import applicationApi from '@/api/application';
import { ApplicationState } from '@/composables/useApplicationState';
import useLoadingFn from '@/composables/useLoadingFn';
import { CFApplication } from '@/models/cf/application';
import { waitUntil } from '@/utils/common';
import { computed, ref } from 'vue';

const props = defineProps<{
  application: CFApplication;
  state: ApplicationState;
  disabled?: boolean;
}>();

const emits = defineEmits<{
  (e: 'launched'): void;
  (e: 'completed'): void;
}>();

const loading = ref(false);
const isDisabled = computed(() => props.disabled || (!loading.value && props.state.state !== 'started'));

const { fn: launchStop } = useLoadingFn(async () => {
  emits('launched');

  await applicationApi.stop(props.application.guid);

  await waitUntil(() => props.state.state === 'stopped');

  emits('completed');
}, loading);
</script>

<template>
  <v-btn @click="launchStop" :loading="loading" :disabled="isDisabled">
    <v-icon>mdi-square-outline</v-icon>
    <v-tooltip activator="parent" location="bottom">Stop</v-tooltip>
  </v-btn>
</template>
