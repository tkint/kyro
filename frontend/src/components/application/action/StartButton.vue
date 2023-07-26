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
}>();

const loading = ref(false);
const disabled = computed(() => !loading.value && props.state.state !== 'stopped');

const { fn: launchStart } = useLoadingFn(async () => {
  await applicationApi.start(props.application.guid);

  await waitUntil(() => props.state.state === 'started');
}, loading);
</script>

<template>
  <v-btn @click="launchStart" :loading="loading" :disabled="disabled">
    <v-icon>mdi-play-outline</v-icon>
    <v-tooltip activator="parent" location="bottom">Start</v-tooltip>
  </v-btn>
</template>
