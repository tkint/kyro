<script setup lang="ts">
import applicationApi from '@/api/application';
import buildApi from '@/api/build';
import dropletApi from '@/api/droplet';
import packageApi from '@/api/package';
import { loadPaginatedData } from '@/composables/useApiCall';
import { ApplicationState } from '@/composables/useApplicationState';
import { useLoadingFn } from '@/composables/useLoadingFn';
import { CFApplication } from '@/models/cf/application';
import { CFPackage } from '@/models/cf/package';
import { waitUntil } from '@/utils/common';
import { matchesOneOf } from '@/utils/string';
import { computed, readonly, ref, watch } from 'vue';

const props = defineProps<{
  application: CFApplication;
  state: ApplicationState;
  disabled?: boolean;
}>();

const emits = defineEmits<{
  (e: 'launched'): void;
  (e: 'completed'): void;
}>();

const loading = ref(matchesOneOf(props.state.state, 'building', 'deprecated-droplet'));
const isDisabled = computed(
  () =>
    props.disabled ||
    (!loading.value && matchesOneOf(props.state.state, 'unknown', 'building', 'deprecated-droplet', 'starting')),
);

watch(
  () => props.state,
  (newValue) => {
    if (matchesOneOf(newValue.state, 'building', 'deprecated-droplet')) {
      loading.value = true;
    }
  },
);

const { fn: launchNewBuild } = useLoadingFn(async () => {
  emits('launched');

  const packagesResult = await loadPaginatedData((page) =>
    packageApi.listForApplication(props.application.guid, { page }),
  );

  if (packagesResult.success) {
    const lastPackage = packagesResult.data.resources.find((p) => p.state === CFPackage.State.READY);

    if (lastPackage) {
      await buildApi.createForPackage(lastPackage.guid);
      await waitUntil(() => props.state.state === 'deprecated-droplet');
    }
  }
}, loading);

const { fn: completeRestage } = useLoadingFn(async () => {
  const currentState = props.state;

  if (currentState.state === 'deprecated-droplet') {
    emits('launched');

    await applicationApi.stop(props.application.guid);
    await dropletApi.updateApplicationDroplet(props.application.guid, { dropletGuid: currentState.dropletGuid });
    await applicationApi.start(props.application.guid);

    await waitUntil(() => props.state.state === 'started');
  }

  emits('completed');
}, loading);

const { fn: launchRestage } = useLoadingFn(async () => {
  if (props.state.state === 'started') {
    await launchNewBuild();
    // await completeRestage();
  } else if (props.state.state === 'deprecated-droplet') {
    await completeRestage();
  }
}, loading);

watch(
  () => props.state,
  (newValue) => {
    if (newValue.state === 'deprecated-droplet') {
      completeRestage();
    }
  },
);

defineExpose({
  loading: readonly(loading),
});
</script>

<template>
  <v-btn @click="launchRestage" :loading="loading" :disabled="isDisabled">
    <v-icon>mdi-archive-refresh-outline</v-icon>
    <v-tooltip activator="parent" location="bottom">Restage</v-tooltip>
  </v-btn>
</template>
