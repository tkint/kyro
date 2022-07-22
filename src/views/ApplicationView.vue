<script lang="ts">
export default {
  name: componentNameFor(RouteNames.APPLICATION),
};
</script>

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
import { componentNameFor, RouteNames } from '@/router';

const props = defineProps<{
  guid: CFApplication['guid'];
}>();

const loading = ref(false);

const {
  response: application,
  loadData: loadApplication,
  error: applicationError,
  resetData: resetApplication,
} = useLoadData(() => applicationsApi.getOne(props.guid, { includeSpace: true, includeOrg: true }), loading);

const {
  response: environment,
  loadData: loadEnvironment,
  error: environmentError,
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

    <v-row
      ><v-col> <api-error-alert v-if="apiError" :error="apiError"></api-error-alert> </v-col
    ></v-row>

    <v-row v-if="application?.success">
      <v-col>
        <application :application="application.data"></application>
      </v-col>
    </v-row>

    <v-row v-if="environment?.success">
      <v-col>
        <environment-table :environment="environment.data"></environment-table>
      </v-col>
    </v-row>
  </v-container>
</template>
