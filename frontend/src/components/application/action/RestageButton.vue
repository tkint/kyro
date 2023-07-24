<script setup lang="ts">
import buildApi from '@/api/build';
import dropletApi from '@/api/droplet';
import packageApi from '@/api/package';
import { loadPaginatedData } from '@/composables/useApiCall';
import { useLoadingFn, useLoadingFnWithCheck } from '@/composables/useLoadingFn';
import { CFApplication } from '@/models/cf/application';
import { CFBuild } from '@/models/cf/build';
import { CFDroplet } from '@/models/cf/droplet';
import { CFPackage } from '@/models/cf/package';
import { findLast, last, sortBy } from 'lodash';
import { readonly, ref, watch } from 'vue';

type State = 'nothing' | 'loading' | 'complete';

const props = defineProps<{
  application: CFApplication;
  disabled?: boolean;
}>();

const loading = ref(false);
const state = ref<State>('nothing');

watch(loading, (newValue) => {
  if (newValue) {
    state.value = 'loading';
  }
});

const { fn: launchNewBuild, launchPolling } = useLoadingFnWithCheck(
  async (launchPolling) => {
    const packagesResult = await loadPaginatedData((page) =>
      packageApi.listForApplication(props.application.guid, { page }),
    );

    if (packagesResult.success) {
      const lastPackage = packagesResult.data.resources.find((p) => p.state === CFPackage.State.READY);

      if (lastPackage) {
        const newBuild = await buildApi.createForPackage(lastPackage.guid);

        if (newBuild.success) {
          await launchPolling();
        }
      }
    }
  },
  async () => {
    const builds = await loadPaginatedData((page) =>
      buildApi.listForApplication(props.application.guid, { states: [CFBuild.State.STAGING], page }),
    );

    return builds.success && builds.data.resources.length === 0;
  },
  3000,
  loading,
);

const { fn: completeRestage } = useLoadingFn(async () => {
  const [builds, droplets] = await Promise.all([
    buildApi.listForApplication(props.application.guid, {
      states: [CFBuild.State.STAGED],
      page: 1,
      perPage: 1,
      orderBy: '-created_at',
    }),
    dropletApi.listForApplication(props.application.guid, { current: true }),
  ]);

  if (builds.success && droplets.success) {
    const lastBuild = builds.data.resources[0];
    const currentDroplet = droplets.data.resources[0];

    if (lastBuild && lastBuild.droplet?.guid !== currentDroplet?.guid) {
      // Arrêter l'application
      // Changer le droplet
      // Redémarrer l'application
      // await applicationApi.restart(props.application.guid);
    }
  }

  // await applicationApi.restart(props.application.guid);
  // state.value = 'complete';
}, loading);

const { fn: launchRestage } = useLoadingFn(async () => {
  await launchNewBuild();
  await completeRestage();
}, loading);

launchPolling().then(() => {
  completeRestage();
});

defineExpose({
  loading: readonly(loading),
  state: readonly(state),
});
</script>

<template>
  <v-btn @click="launchRestage" :loading="loading" :disabled="disabled">
    <v-icon>mdi-archive-refresh-outline</v-icon>
    <v-tooltip activator="parent" location="bottom">Restage</v-tooltip>
  </v-btn>
</template>
