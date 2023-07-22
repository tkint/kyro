<script setup lang="ts">
import processApi from '@/api/process';
import sshApi from '@/api/ssh';
import ApplicationCard from '@/components/application/ApplicationCard.vue';
import ApplicationConfigurationCard from '@/components/application/ApplicationConfigurationCard.vue';
import ApplicationInstancesCard from '@/components/application/ApplicationInstancesCard.vue';
import ApplicationSshCard from '@/components/application/ApplicationSshCard.vue';
import useApplicationContext from '@/composables/useApplicationContext';
import useLoadData from '@/composables/useLoadData';
import { computed, watch } from 'vue';

const context = useApplicationContext();
const application = computed(() => context.application.value);

const {
  data: processes,
  error: processesError,
  loadData: loadProcesses,
  resetData: resetProcesses,
} = useLoadData(() => processApi.getStatsForApplication(context.guid.value, 'web'), context.loading);

const {
  data: sshEnabled,
  error: sshEnabledError,
  loadData: loadSSHEnabled,
  resetData: resetSSHEnabled,
} = useLoadData(() => sshApi.getSSHEnabledForApplication(context.guid.value), context.loading);

loadProcesses();
loadSSHEnabled();

context.on('reload', () => {
  loadProcesses();
  loadSSHEnabled();
});
context.on('reset', () => {
  resetProcesses();
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
      <application-card :application="application"></application-card>
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
