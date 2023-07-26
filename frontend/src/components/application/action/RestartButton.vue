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
const disabled = computed(() => !loading.value && props.state.state !== 'started');

const { fn: launchRestart } = useLoadingFn(async () => {
  await applicationApi.restart(props.application.guid);

  await waitUntil(() => props.state.state === 'started');
}, loading);
</script>

<template>
  <v-btn @click="launchRestart" :loading="loading" :disabled="disabled">
    <v-icon>mdi-reload</v-icon>
    <v-tooltip activator="parent" location="bottom">Restart</v-tooltip>
  </v-btn>
</template>
