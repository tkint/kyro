<script setup lang="ts">
import processApi from '@/api/process';
import sshApi from '@/api/ssh';
import ApplicationCard from '@/components/application/ApplicationCard.vue';
import ApplicationConfigurationCard from '@/components/application/ApplicationConfigurationCard.vue';
import ApplicationInstancesCard from '@/components/application/ApplicationInstancesCard.vue';
import ApplicationSshCard from '@/components/application/ApplicationSshCard.vue';
import useApiCall from '@/composables/useApiCall';
import useApplicationContext from '@/composables/useApplicationContext';
import { computed, watch } from 'vue';

const context = useApplicationContext();
const application = computed(() => context.application.value);

const {
  data: processes,
  error: processesError,
  execute: loadProcesses,
} = useApiCall(async () => {
  const state = context.state.value;

  if ('processes' in state) return state.processes;

  return processApi.getStatsForApplication(context.guid.value, 'web');
}, context.loading);

watch(
  () => context.state.value,
  () => {
    loadProcesses();
  },
  { deep: true },
);

const {
  data: sshEnabled,
  error: sshEnabledError,
  execute: loadSSHEnabled,
  reset: resetSSHEnabled,
} = useApiCall(() => sshApi.getSSHEnabledForApplication(context.guid.value), context.loading);

loadProcesses();
loadSSHEnabled();

context.on('reload', () => {
  loadSSHEnabled();
});
context.on('reset', () => {
  resetSSHEnabled();
});

watch([processesError, sshEnabledError], (newValue) => {
  newValue.forEach((error) => {
    if (error) {
      context.errors.value.push(error);
    }
  });
});
</script>

<template>
  <v-row class="">
    <v-col>
      <application-card :application="application" :state="context.state.value"></application-card>
    </v-col>

    <v-col>
      <v-row>
        <v-col>
          <application-configuration-card :application="application"></application-configuration-card>
        </v-col>
      </v-row>

      <v-row v-if="sshEnabled">
        <v-col>
          <application-ssh-card :ssh-enabled="sshEnabled"></application-ssh-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>

  <v-row v-if="application && processes">
    <v-col>
      <application-instances-card :application="application" :processes="processes"></application-instances-card>
    </v-col>
  </v-row>
</template>
