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
import { computed, readonly, ref, watch } from 'vue';

const props = defineProps<{
  application: CFApplication;
  state: ApplicationState;
}>();

const loading = ref(props.state.state === 'building' || props.state.state === 'deprecated-droplet');
const disabled = computed(
  () =>
    !loading.value &&
    (props.state.state === 'unknown' ||
      props.state.state === 'building' ||
      props.state.state === 'deprecated-droplet' ||
      props.state.state === 'starting'),
);

watch(
  () => props.state,
  (newValue) => {
    if (newValue.state === 'building' || newValue.state === 'deprecated-droplet') {
      loading.value = true;
    }
  },
);

const { fn: launchNewBuild } = useLoadingFn(async () => {
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
    await applicationApi.stop(props.application.guid);
    await dropletApi.updateApplicationDroplet(props.application.guid, { dropletGuid: currentState.dropletGuid });
    await applicationApi.start(props.application.guid);

    await waitUntil(() => props.state.state === 'started');
  }
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
  <v-btn @click="launchRestage" :loading="loading" :disabled="disabled">
    <v-icon>mdi-archive-refresh-outline</v-icon>
    <v-tooltip activator="parent" location="bottom">Restage</v-tooltip>
  </v-btn>
</template>
