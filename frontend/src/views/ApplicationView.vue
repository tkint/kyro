<script setup lang="ts">
import { ApiErrorResponse, compactErrors } from '@/api';
import applicationApi from '@/api/application';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import RestageButton from '@/components/application/action/RestageButton.vue';
import RestartButton from '@/components/application/action/RestartButton.vue';
import StartButton from '@/components/application/action/StartButton.vue';
import StopButton from '@/components/application/action/StopButton.vue';
import useApiCall from '@/composables/useApiCall';
import { provideApplicationContext } from '@/composables/useApplicationContext';
import useApplicationState from '@/composables/useApplicationState';
import { RouteNames } from '@/core/router';
import { onCachedActivated } from '@/hooks';
import { CFApplication } from '@/models/cf/application';
import { CFInclude } from '@/models/cf/common';
import { computed, onDeactivated, ref } from 'vue';

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
  () => applicationApi.getOne(props.guid, { includes: [CFInclude.SPACE, CFInclude.SPACE_ORGANIZATION] }),
  loading,
);

const { watchState } = useApplicationState();
const { state, ...stateWatcher } = watchState({ guid: props.guid });

const loadAllData = async (reset: boolean = false) => {
  if (reset) {
    resetApplication();
    trigger('reset');
    stateWatcher.update({ guid: props.guid });
  }
  loadApplication();
  trigger('reload');
  stateWatcher.start({ resetState: reset, eager: true });
};

const errors = ref<ApiErrorResponse[]>([]);
const compactedErrors = computed<ApiErrorResponse | undefined>(() =>
  compactErrors(applicationError.value, ...errors.value),
);

onCachedActivated(
  () => props.guid,
  (invalidate) => {
    loadAllData(invalidate);
  },
);

onDeactivated(() => {
  stateWatcher.stop();
});

const { trigger } = provideApplicationContext({
  guid: computed(() => props.guid),
  state,
  loading,
  errors,
  application: computed(() => application.value),
});

const refRestageButton = ref<{ loading: boolean }>();
const restaging = computed(() => !!refRestageButton.value?.loading);
</script>

<template>
  <v-container fluid class="pa-0">
    <v-progress-linear indeterminate :color="loading ? 'primary' : 'transparent'"></v-progress-linear>

    <v-row v-if="compactedErrors">
      <v-col>
        <api-error-alert :error="compactedErrors"></api-error-alert>
      </v-col>
    </v-row>

    <v-row v-if="restaging">
      <v-col>
        <v-alert density="compact" type="info">
          <v-alert-title>Restage en cours</v-alert-title>
          Rester sur la page pour que le processus se complète
        </v-alert>
      </v-col>
    </v-row>

    <v-card v-if="application" flat>
      <v-toolbar density="compact">
        <v-toolbar-title class="v-col-auto">
          {{ application.name }}
        </v-toolbar-title>

        <v-btn-group variant="text">
          <start-button :application="application" :state="state"></start-button>

          <stop-button :application="application" :state="state"></stop-button>

          <restart-button :application="application" :state="state"></restart-button>

          <restage-button ref="refRestageButton" :application="application" :state="state"></restage-button>

          <v-btn disabled>
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
