<script setup lang="ts">
import serviceApi from '@/api/service';
import ServiceCardDetails from '@/components/services/ServiceCardDetails.vue';
import ServiceCardItem from '@/components/services/ServiceCardItem.vue';
import { ServiceDetails, ServiceWithBinding } from '@/components/services/models';
import useApplicationContext from '@/composables/useApplicationContext';
import useFilterData from '@/composables/useFilterData';
import useLoadData from '@/composables/useLoadData';
import { mapResources } from '@/models/cf/common';
import { onSuccess, successOf } from '@/utils/result';
import { ref } from 'vue';

type DialogState =
  | {
      opened: false;
      service: undefined;
    }
  | {
      opened: true;
      service: ServiceDetails;
    };

const context = useApplicationContext();

const {
  data: services,
  error: servicesError,
  loadData,
  resetData,
} = useLoadData(async () => {
  const result = await serviceApi.getBindingsForApplication(context.guid.value).then((result) =>
    onSuccess(result, ({ resources }) => {
      const guids = resources.map((binding) => binding.relationships.service_instance.data.guid);

      return serviceApi.getInstances(guids);
    }),
  );

  if (result.success) {
    const [bindings, services] = result.data;

    return successOf(
      mapResources(services, (service) => {
        const binding = bindings.resources.find(
          (binding) => binding.relationships.service_instance.data.guid === service.guid,
        );

        return {
          ...service,
          binding: binding!!,
        };
      }),
    );
  }

  return result;
}, context.loading);

loadData();

context.on('reload', () => {
  loadData();
});
context.on('reset', () => {
  resetData();
});

const { data: filteredServices, filters } = useFilterData((filters, { includesText }) => {
  return services.value?.resources.filter((service) => {
    return !filters.text || includesText(service.name);
  });
});

const dialog = ref<DialogState>({ opened: false, service: undefined });
const openService = async (service: ServiceWithBinding) => {
  context.loading.value = true;

  const details = await serviceApi.getBindingsDetails(service.binding.guid);

  dialog.value = {
    opened: true,
    service: {
      ...service,
      details: details.success ? details.data : undefined,
    },
  };

  context.loading.value = false;
};
</script>

<template>
  <v-row class="flex-column" v-if="services">
    <v-col>
      <v-dialog v-model="dialog.opened" width="80%" scrollable>
        <service-card-details v-if="dialog.service" :service="dialog.service"></service-card-details>
      </v-dialog>

      <v-row justify="end">
        <v-col cols="3">
          <v-text-field label="Filtrer" density="compact" v-model="filters.text" clearable hide-details></v-text-field>
        </v-col>

        <v-col cols="auto">
          <v-btn variant="text" @click="loadData" size="large">
            <v-icon>mdi-cached</v-icon>
          </v-btn>
        </v-col>

        <v-col cols="auto">{{ filteredServices.length }}/{{ services.resources.length }}</v-col>
      </v-row>

      <v-row>
        <v-col cols="3" v-for="service in filteredServices" :key="`application-${service.guid}`">
          <service-card-item :service="service" @click="openService(service)"></service-card-item>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
