<script setup lang="ts">
import { computed, ref } from 'vue';
import { ApiErrorResponse, compactErrors } from '@/api';
import applicationsApi from '@/api/applications';
import environmentApi from '@/api/environment';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import Application from '@/components/application/Application.vue';
import EnvironmentTable from '@/components/environment/EnvironmentTable.vue';
import useLoadData from '@/composables/useLoadData';
import { onCachedActivated } from '@/hooks';
import { CFApplication } from '@/models/cf/application';
import { CFInclude } from '@/models/cf/common';

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

const apiError = computed<ApiErrorResponse | undefined>(() =>
  compactErrors(applicationError.value, environmentError.value),
);

onCachedActivated(
  () => props.guid,
  (invalidate) => {
    if (invalidate) {
      resetApplication();
      resetEnvironment();
    }
    loadApplication();
    loadEnvironment();
  },
);
</script>

<template>
  <v-container fluid>
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <v-row v-if="apiError">
      <v-col>
        <api-error-alert :error="apiError"></api-error-alert>
      </v-col>
    </v-row>

    <v-row v-if="application">
      <v-col>
        <application :application="application"></application>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <environment-table :environment="environment" v-if="environment"></environment-table>
      </v-col>
    </v-row>
  </v-container>
</template>
