<script setup lang="ts">
import routeApi from '@/api/route';
import RouteCreateForm from '@/components/route/RouteCreateForm.vue';
import RouteTable from '@/components/route/RouteTable.vue';
import useApplicationContext from '@/composables/useApplicationContext';
import useFilterData from '@/composables/useFilterData';
import useLoadData from '@/composables/useLoadData';
import { computed, ref } from 'vue';

const context = useApplicationContext();
const application = computed(() => context.application.value);

const { data, error, loadData, resetData } = useLoadData(
  () => routeApi.getForApplication(context.guid.value),
  context.loading,
);

loadData();

context.on('reload', () => {
  loadData();
});
context.on('reset', () => {
  resetData();
});

const routes = computed(() =>
  data.value?.resources.map((route) => {
    return {
      ...route,
      destinations: route.destinations.filter((destination) => destination.app.guid === context.guid.value),
    };
  }),
);

const { data: filteredRoutes, filters } = useFilterData((filters, { includesText }) => {
  return routes.value?.filter((route) => {
    return !filters.text || includesText(route.url);
  });
});

const createFormDialog = ref(false);
const openCreateFormDialog = () => {
  createFormDialog.value = true;
};
</script>

<template>
  <v-row class="flex-column" v-if="data">
    <v-dialog v-model="createFormDialog" width="500">
      <route-create-form :space-guid="application.relationships.space.data.guid"></route-create-form>
    </v-dialog>

    <v-col>
      <v-row justify="end">
        <v-col cols="3">
          <v-text-field label="Filtrer" density="compact" v-model="filters.text" clearable hide-details></v-text-field>
        </v-col>

        <v-col cols="auto">
          <v-btn variant="text" @click="loadData" size="large">
            <v-icon>mdi-cached</v-icon>
          </v-btn>

          <v-btn variant="text" size="large" @click="openCreateFormDialog()">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>

        <v-col cols="auto">{{ filteredRoutes.length }}/{{ data.resources.length }}</v-col>
      </v-row>

      <route-table :routes="filteredRoutes"></route-table>
    </v-col>
  </v-row>
</template>
