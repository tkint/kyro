<script setup lang="ts">
import { computed, ref } from 'vue';
import { ApiErrorResponse, compactErrors } from '@/api';
import applicationsApi from '@/api/application';
import environmentApi from '@/api/environment';
import processApi from '@/api/process';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import ApplicationCard from '@/components/application/ApplicationCard.vue';
import ApplicationResume from '@/components/application/ApplicationConfigurationCard.vue';
import ApplicationInstancesCard from '@/components/application/ApplicationInstancesCard.vue';
import EnvironmentTable from '@/components/environment/EnvironmentTable.vue';
import useLoadData from '@/composables/useLoadData';
import { onCachedActivated } from '@/hooks';
import { CFApplication } from '@/models/cf/application';
import { CFInclude } from '@/models/cf/common';
import ApplicationConfigurationCard from '../components/application/ApplicationConfigurationCard.vue';

const props = defineProps<{
  guid: CFApplication['guid'];
}>();

const loading = ref(false);

const {
  data: application,
  error: applicationError,
  loadData: loadApplication,
  resetData: resetApplication,
} = useLoadData(
  () => applicationsApi.getOne(props.guid, { includes: [CFInclude.SPACE, CFInclude.SPACE_ORGANIZATION] }),
  loading,
);

const {
  data: environment,
  error: environmentError,
  loadData: loadEnvironment,
  resetData: resetEnvironment,
} = useLoadData(() => environmentApi.getForApplication(props.guid), loading);

const {
  data: processes,
  error: processesError,
  loadData: loadProcesses,
  resetData: resetProcesses,
} = useLoadData(() => processApi.getStatsForApplication(props.guid, 'web'), loading);

const apiError = computed<ApiErrorResponse | undefined>(() =>
  compactErrors(applicationError.value, environmentError.value, processesError.value),
);

onCachedActivated(
  () => props.guid,
  (invalidate) => {
    if (invalidate) {
      resetApplication();
      resetEnvironment();
      resetProcesses();
    }
    loadApplication();
    loadEnvironment();
    loadProcesses();
  },
);
</script>

<template>
  <v-container fluid class="pa-0">
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <v-row v-if="apiError">
      <v-col>
        <api-error-alert :error="apiError"></api-error-alert>
      </v-col>
    </v-row>

    <v-card v-if="application" flat>
      <v-toolbar density="compact" class="position-fixed w-100" style="z-index: 1">
        <v-toolbar-title class="v-col-auto">
          {{ application.name }}
        </v-toolbar-title>

        <v-btn :disabled="application.state === 'STARTED'">Start</v-btn>
        <v-btn :disabled="application.state === 'STOPPED'">Stop</v-btn>
        <v-btn :disabled="application.state === 'STARTED'">Restart</v-btn>
        <v-btn>Restage</v-btn>
      </v-toolbar>

      <v-card-text class="mt-10">
        <v-row class="">
          <v-col>
            <application-card :application="application"></application-card>
          </v-col>

          <v-col>
            <application-configuration-card :application="application"></application-configuration-card>
          </v-col>

          <v-col v-if="processes">
            <application-instances-card :application="application" :processes="processes"></application-instances-card>
          </v-col>
        </v-row>
        <!-- 
        <v-row v-if="processes">
          <v-col>
            <application-instances-card :application="application" :processes="processes"></application-instances-card>
          </v-col>
        </v-row> -->

        <v-row v-if="environment">
          <v-col>
            <environment-table :environment="environment"></environment-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>
