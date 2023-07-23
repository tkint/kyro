<script setup lang="ts">
import { ApiErrorResponse, compactErrors } from '@/api';
import applicationsApi from '@/api/application';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import useApiCall from '@/composables/useApiCall';
import { provideApplicationContext } from '@/composables/useApplicationContext';
import { RouteNames } from '@/core/router';
import { onCachedActivated } from '@/hooks';
import { CFApplication } from '@/models/cf/application';
import { CFInclude } from '@/models/cf/common';
import { computed, ref } from 'vue';

const props = defineProps<{
  guid: CFApplication['guid'];
}>();

const loading = ref(false);

const {
  data: application,
  error: applicationError,
  execute: loadApplication,
  reset: resetApplication,
} = useApiCall(
  () => applicationsApi.getOne(props.guid, { includes: [CFInclude.SPACE, CFInclude.SPACE_ORGANIZATION] }),
  loading,
);

const loadAllData = (invalidate: boolean = false) => {
  if (invalidate) {
    resetApplication();
    trigger('reset');
  }
  loadApplication();
  trigger('reload');
};

const errors = ref<ApiErrorResponse[]>([]);
const compactedErrors = computed<ApiErrorResponse | undefined>(() =>
  compactErrors(applicationError.value, ...errors.value),
);

const executeAction = async (action: 'start' | 'stop' | 'restart') => {
  if (application.value) {
    loading.value = true;
    await applicationsApi.executeAction(application.value.guid, action);
    loading.value = false;
  }
};

onCachedActivated(
  () => props.guid,
  (invalidate) => loadAllData(invalidate),
);

const { trigger } = provideApplicationContext({
  guid: computed(() => props.guid),
  loading,
  errors,
  application: computed(() => application.value),
});
</script>

<template>
  <v-container fluid class="pa-0">
    <v-progress-linear indeterminate :color="loading ? 'primary' : 'transparent'"></v-progress-linear>

    <v-row v-if="compactedErrors">
      <v-col>
        <api-error-alert :error="compactedErrors"></api-error-alert>
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
          <v-list-item title="Routes" :to="{ name: RouteNames.APPLICATION_ROUTES, params: { guid: application.guid } }">
          </v-list-item>
          <v-list-item
            title="Services"
            :to="{ name: RouteNames.APPLICATION_SERVICES, params: { guid: application.guid } }">
          </v-list-item>
          <v-list-item
            title="Log Stream"
            :to="{ name: RouteNames.APPLICATION_LOG_STREAM, params: { guid: application.guid } }">
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-card-text v-if="application">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component"></component>
          </keep-alive>
        </router-view>
      </v-card-text>
    </v-card>
  </v-container>
</template>
