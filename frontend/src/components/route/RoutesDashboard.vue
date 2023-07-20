<script setup lang="ts">
import routeApi from '@/api/route';
import useApplicationContext from '@/composables/useApplicationContext';
import useFilterData from '@/composables/useFilterData';
import useLoadData from '@/composables/useLoadData';
import { formatDate } from '@/utils/date';
import { computed } from 'vue';

const context = useApplicationContext();

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
</script>

<template>
  <v-row class="flex-column" v-if="data">
    <v-col>
      <v-row>
        <v-col>
          <v-text-field clearable label="Filtrer" density="compact" v-model="filters.text"></v-text-field>
        </v-col>

        <v-col cols="auto">
          <v-btn variant="text" @click="loadData" size="large">
            <v-icon>mdi-cached</v-icon>
          </v-btn>
        </v-col>

        <v-col cols="auto">{{ filteredRoutes.length }}/{{ data.resources.length }}</v-col>
      </v-row>

      <v-table>
        <thead>
          <tr>
            <th>Route</th>
            <th>Port</th>
            <th>Creation date</th>
            <th>Destinations</th>
          </tr>
        </thead>

        <tbody>
          <template v-for="route in filteredRoutes" :key="`route-${route.guid}`">
            <tr>
              <td>
                <a target="_blank" :href="`${route.protocol}://${route.url}`">
                  {{ route.protocol }}://{{ route.url }}
                </a>
              </td>

              <td>{{ route.port || '--' }}</td>

              <td>{{ formatDate(route.created_at, 'DD/MM/YYYY HH:mm:ss') }}</td>

              <td>
                <div v-for="destination in route.destinations" :key="`destination-${destination.guid}`">
                  {{ destination.protocol }} - {{ destination.port }}
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
</template>
