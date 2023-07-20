<script setup lang="ts">
import serviceApi from '@/api/service';
import ServiceItem from '@/components/services/ServiceItem.vue';
import useApplicationContext from '@/composables/useApplicationContext';
import useFilterData from '@/composables/useFilterData';
import useLoadData from '@/composables/useLoadData';

const context = useApplicationContext();

const { data, error, loadData, resetData } = useLoadData(async () => {
  const bindings = await serviceApi.getBindingsForApplication(context.guid.value);
  if (bindings.success) {
    const guids = bindings.data.resources.map((binding) => binding.relationships.service_instance.data.guid);
    return await serviceApi.getInstances(guids);
  }
  return bindings;
}, context.loading);

loadData();

context.on('reload', () => {
  loadData();
});
context.on('reset', () => {
  resetData();
});

const { data: filteredServices, filters } = useFilterData((filters, { includesText }) => {
  return data.value?.resources.filter((service) => {
    return !filters.text || includesText(service.name);
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

        <v-col cols="auto">{{ filteredServices.length }}/{{ data.resources.length }}</v-col>
      </v-row>

      <v-row>
        <v-col cols="3" v-for="service in filteredServices" :key="`application-${service.guid}`">
          <service-item :service="service"></service-item>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
