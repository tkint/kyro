<script setup lang="ts">
import ServiceItem from '@/components/services/ServiceItem.vue';
import useApplicationContext from '@/composables/useApplicationContext';
import useFilterData from '@/composables/useFilterData';

const { services, reload } = useApplicationContext();

const { data: filteredServices, filters } = useFilterData((filters, { includesText }) => {
  return services.value?.resources.filter((service) => {
    return !filters.text || includesText(service.name);
  });
});

const reloadData = () => reload('services');
</script>

<template>
  <v-row class="flex-column" v-if="services">
    <v-col>
      <v-row>
        <v-col>
          <v-text-field clearable label="Filtrer" density="compact" v-model="filters.text"></v-text-field>
        </v-col>

        <v-col cols="auto">
          <v-btn variant="text" @click="reloadData" size="large">
            <v-icon>mdi-cached</v-icon>
          </v-btn>
        </v-col>

        <v-col cols="auto">{{ filteredServices.length }}/{{ services.resources.length }}</v-col>
      </v-row>

      <v-row>
        <v-col cols="3" v-for="service in filteredServices" :key="`application-${service.guid}`">
          <service-item :service="service"></service-item>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
