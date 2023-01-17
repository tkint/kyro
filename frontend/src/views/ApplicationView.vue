<script setup lang="ts">
import { computed, ref } from 'vue';
import { ApiErrorResponse, compactErrors } from '@/api';
import applicationsApi from '@/api/application';
import environmentApi from '@/api/environment';
import processApi from '@/api/process';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import { provideApplicationContext } from '@/composables/useApplicationContext';
import useLoadData from '@/composables/useLoadData';
import { onCachedActivated } from '@/hooks';
import { CFApplication } from '@/models/cf/application';
import { CFInclude } from '@/models/cf/common';
import { RouteNames } from '@/router';

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

const loadAllData = (invalidate: boolean = false) => {
  if (invalidate) {
    resetApplication();
    resetEnvironment();
    resetProcesses();
  }
  loadApplication();
  loadEnvironment();
  loadProcesses();
};

const apiError = computed<ApiErrorResponse | undefined>(() =>
  compactErrors(applicationError.value, environmentError.value, processesError.value),
);

const executeAction = async (action: 'start' | 'stop' | 'restart') => {
  if (application.value) {
    loading.value = true;
    await applicationsApi.executeAction(application.value.guid, action);
    loading.value = false;
  }
};

onCachedActivated(() => props.guid, loadAllData);

provideApplicationContext({
  application,
  environment,
  processes,
  reload: (part, ...others) => {
    const parts = [part, ...others];

    if (parts.includes('application')) {
      loadApplication();
    }
    if (parts.includes('environment')) {
      loadEnvironment();
    }
    if (parts.includes('processes')) {
      loadProcesses();
    }
  },
});
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
      <v-toolbar density="compact">
        <v-toolbar-title class="v-col-auto">
          {{ application.name }}
        </v-toolbar-title>

        <v-btn-group variant="text">
          <v-btn :disabled="application.state === 'STARTED'" @click="executeAction('start')">
            <v-icon>mdi-play-outline</v-icon>
            <v-tooltip activator="parent" location="bottom">Start</v-tooltip>
          </v-btn>

          <v-btn :disabled="application.state === 'STOPPED'" @click="executeAction('stop')">
            <v-icon>mdi-square-outline</v-icon>
            <v-tooltip activator="parent" location="bottom">Stop</v-tooltip>
          </v-btn>

          <v-btn :disabled="application.state === 'STOPPED'" @click="executeAction('restart')">
            <v-icon>mdi-reload</v-icon>
            <v-tooltip activator="parent" location="bottom">Restart</v-tooltip>
          </v-btn>

          <v-btn>
            <v-icon>mdi-archive-refresh-outline</v-icon>
            <v-tooltip activator="parent" location="bottom">Restage</v-tooltip>
          </v-btn>

          <v-btn>
            <v-icon>mdi-delete-outline</v-icon>
            <v-tooltip activator="parent" location="bottom">Delete</v-tooltip>
          </v-btn>
        </v-btn-group>

        <v-spacer></v-spacer>

        <v-btn variant="text" @click="loadAllData()" size="large">
          <v-icon>mdi-cached</v-icon>
          <v-tooltip activator="parent" location="bottom">Reload</v-tooltip>
        </v-btn>
      </v-toolbar>

      <v-navigation-drawer order="2">
        <v-list density="compact">
          <v-list-item
            title="Application"
            :to="{ name: RouteNames.APPLICATION, params: { guid: application.guid } }"
            exact>
          </v-list-item>
          <v-list-item
            title="Environnement"
            :to="{ name: RouteNames.APPLICATION_ENVIRONMENT, params: { guid: application.guid } }">
          </v-list-item>
          <v-list-item
            title="Log Stream"
            :to="{ name: RouteNames.APPLICATION_LOG_STREAM, params: { guid: application.guid } }">
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-card-text v-if="application && environment && processes">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component"></component>
          </keep-alive>
        </router-view>
      </v-card-text>
    </v-card>
  </v-container>
</template>
