<script setup lang="ts">
import routeApi from '@/api/route';
import RouteCreateForApplicationForm from '@/components/route/RouteCreateForApplicationForm.vue';
import RouteTable from '@/components/route/RouteTable.vue';
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue';
import useApiCall, { usePaginatedApiCall } from '@/composables/useApiCall';
import useApplicationContext from '@/composables/useApplicationContext';
import useFilterData from '@/composables/useFilterData';
import useLoadingFn from '@/composables/useLoadingFn';
import { CFRoute } from '@/models/cf/route';
import { computed, reactive, ref } from 'vue';

const context = useApplicationContext();
const application = computed(() => context.application.value);

const {
  data: routes,
  execute: loadRoutes,
  reset: resetRoutes,
} = useApiCall(() => routeApi.listForApplication(context.guid.value), context.loading);

const {
  data: domains,
  loading: loadingDomains,
  execute: loadDomains,
  reset: resetDomains,
} = usePaginatedApiCall((page) => routeApi.listDomains({ page, perPage: 20 }));

loadRoutes();

context.on('reload', () => {
  loadRoutes();
});
context.on('reset', () => {
  resetRoutes();
  resetDomains();
});

const computedRoutes = computed(() =>
  routes.value?.resources.map((route) => {
    return {
      ...route,
      destinations: route.destinations.filter((destination) => destination.app.guid === context.guid.value),
    };
  }),
);

const { data: filteredRoutes, filters } = useFilterData((filters, { includesText }) => {
  return computedRoutes.value?.filter((route) => {
    return !filters.text || includesText(route.url);
  });
});

const createDialog = ref(false);
const openCreateDialog = async () => {
  if (!domains.value) {
    await loadDomains();
  }
  createDialog.value = true;
};
const handleCreateSuccess = async (data: { route: CFRoute }) => {
  if (routes.value) {
    const { resources } = routes.value;

    const routeIndex = resources.findIndex(({ guid }) => guid === data.route.guid);
    if (routeIndex > -1) {
      routes.value.resources.splice(routeIndex, 1, data.route);
    } else {
      routes.value.resources.push(data.route);
    }
  }

  createDialog.value = false;
};

const unmappingState = reactive<{ dialog: boolean; route?: CFRoute }>({ dialog: false });
const startUnmapping = (route: CFRoute) => {
  unmappingState.route = route;
  unmappingState.dialog = true;
};
const { fn: confirmUnmapping, loading: confirming } = useLoadingFn(async () => {
  const { route } = unmappingState;
  if (route) {
    const destination = route.destinations.find((dest) => dest.app.guid === application.value.guid);

    if (destination) {
      const result = await routeApi.deleteDestination(route.guid, destination.guid);

      if (result.success && routes.value) {
        const routeIndex = routes.value.resources.findIndex(({ guid }) => guid === route.guid);
        if (routeIndex > -1) {
          routes.value.resources.splice(routeIndex, 1);
        }
      }
    }

    unmappingState.dialog = false;
    unmappingState.route = undefined;
  }
});
</script>

<template>
  <v-row class="flex-column" v-if="routes">
    <v-dialog v-model="createDialog" width="500">
      <route-create-for-application-form
        v-if="domains"
        :application="application"
        :domains="domains.resources"
        @success="handleCreateSuccess"
        @cancel="createDialog = false">
      </route-create-for-application-form>
    </v-dialog>

    <confirm-dialog v-model="unmappingState.dialog" @confirm="confirmUnmapping" :loading="confirming">
      <template #text>Déconnecter la route `{{ unmappingState.route?.url }}` ?</template>
    </confirm-dialog>

    <v-col>
      <v-row justify="end">
        <v-col cols="3">
          <v-text-field label="Filtrer" density="compact" v-model="filters.text" clearable hide-details></v-text-field>
        </v-col>

        <v-col cols="auto">
          <v-btn variant="text" @click="loadRoutes" size="large">
            <v-icon>mdi-cached</v-icon>
          </v-btn>

          <v-btn variant="text" size="large" :loading="loadingDomains" @click="openCreateDialog()">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>

        <v-col cols="auto">{{ filteredRoutes.length }}/{{ routes.resources.length }}</v-col>
      </v-row>

      <route-table :routes="filteredRoutes" @unmap="startUnmapping"></route-table>
    </v-col>
  </v-row>
</template>
