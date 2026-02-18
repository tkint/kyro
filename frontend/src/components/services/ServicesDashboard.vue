<script setup lang="ts">
import { ApiErrorResponse, buildApiErrorResponse } from '@/api';
import serviceApi from '@/api/service';
import ServiceCardDetails from '@/components/services/ServiceCardDetails.vue';
import ServiceCardItem from '@/components/services/ServiceCardItem.vue';
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue';
import { ServiceDetails, ServiceWithBinding } from '@/components/services/models';
import useApiCall from '@/composables/useApiCall';
import useApplicationContext from '@/composables/useApplicationContext';
import useFilterData from '@/composables/useFilterData';
import useLoadingFn from '@/composables/useLoadingFn';
import { mapResources } from '@/models/cf/common';
import { onSuccess, successOf } from '@/utils/result';
import { computed, ref, watch } from 'vue';

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
  execute: loadData,
  reset: resetData,
} = useApiCall(async () => {
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
const cardsPerRow = ref<1 | 2 | 4>(4);
const layoutManuallySelected = ref(false);
const suggestedCardsPerRow = (count: number): 1 | 2 | 4 => {
  if (count <= 1) return 1;
  if (count < 4) return 2;
  return 4;
};
const cardCols = computed(() => {
  switch (cardsPerRow.value) {
    case 1:
      return 12;
    case 2:
      return 6;
    case 4:
    default:
      return 3;
  }
});
const cycleCardsPerRow = () => {
  layoutManuallySelected.value = true;
  switch (cardsPerRow.value) {
    case 4:
      cardsPerRow.value = 2;
      break;
    case 2:
      cardsPerRow.value = 1;
      break;
    case 1:
    default:
      cardsPerRow.value = 4;
      break;
  }
};
const cardsPerRowIcon = computed(() => {
  switch (cardsPerRow.value) {
    case 4:
      return 'mdi-view-grid-outline';
    case 2:
      return 'mdi-view-agenda-outline';
    case 1:
    default:
      return 'mdi-view-stream-outline';
  }
});
watch(
  () => filteredServices.value.length,
  (count) => {
    if (!layoutManuallySelected.value) {
      cardsPerRow.value = suggestedCardsPerRow(count);
    }
  },
  { immediate: true },
);

const dialog = ref<DialogState>({ opened: false, service: undefined });
const deleting = ref(false);
const deletingBindingGuid = ref<ServiceWithBinding['binding']['guid']>();
const deleteDialog = ref<{ opened: boolean; service?: ServiceWithBinding; deleteInstance: boolean }>({
  opened: false,
  service: undefined,
  deleteInstance: false,
});

const wait = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs));
const waitForBindingDeletion = async (bindingGuid: ServiceWithBinding['binding']['guid']) => {
  for (let i = 0; i < 20; i++) {
    const result = await serviceApi.getBindingsForApplication(context.guid.value);
    if (!result.success) {
      break;
    }

    const exists = result.data.resources.some((binding) => binding.guid === bindingGuid);
    if (!exists) {
      return;
    }

    await wait(1000);
  }
};

const waitForServiceInstanceDeletion = async (serviceGuid: ServiceWithBinding['guid']) => {
  for (let i = 0; i < 20; i++) {
    const result = await serviceApi.getInstances([serviceGuid]);
    if (!result.success) {
      break;
    }

    const exists = result.data.resources.some((service) => service.guid === serviceGuid);
    if (!exists) {
      return;
    }

    await wait(1000);
  }
};

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

const requestDeleteService = (service: ServiceWithBinding) => {
  deleteDialog.value = { opened: true, service, deleteInstance: false };
};

const { fn: confirmDeleteService } = useLoadingFn(async () => {
  const service = deleteDialog.value.service;
  if (!service) return;

  deletingBindingGuid.value = service.binding.guid;
  const result = await serviceApi.deleteBinding(service.binding.guid);
  if (result.success) {
    await waitForBindingDeletion(service.binding.guid);

    if (deleteDialog.value.deleteInstance) {
      const bindingsResult = await serviceApi.getBindingsForInstance(service.guid);
      if (bindingsResult.success) {
        if (bindingsResult.data.resources.length === 0) {
          const deleteInstanceResult = await serviceApi.deleteInstance(service.guid);
          if (deleteInstanceResult.success) {
            await waitForServiceInstanceDeletion(service.guid);
          } else {
            context.errors.value.push(deleteInstanceResult.error as ApiErrorResponse);
          }
        } else {
          context.errors.value.push(
            buildApiErrorResponse({
              title: 'Service instance still in use',
              detail: `The service instance is still bound (${bindingsResult.data.resources.length} binding(s) remaining) and cannot be deleted.`,
            }),
          );
        }
      } else {
        context.errors.value.push(bindingsResult.error as ApiErrorResponse);
      }
    }

    deleteDialog.value = { opened: false, service: undefined, deleteInstance: false };
    loadData();
  } else {
    context.errors.value.push(result.error as ApiErrorResponse);
  }

  deletingBindingGuid.value = undefined;
}, deleting);
</script>

<template>
  <v-row class="flex-column" v-if="services">
    <v-col>
      <v-dialog v-model="dialog.opened" width="80%" scrollable>
        <service-card-details v-if="dialog.service" :service="dialog.service"></service-card-details>
      </v-dialog>

      <confirm-dialog v-model="deleteDialog.opened" @confirm="confirmDeleteService" :loading="deleting">
        <template #text>
          <div>
            Delete service `{{ deleteDialog.service?.name }}` from application `{{ context.application.value.name }}`?
            This removes the binding from this app.
          </div>
          <v-checkbox
            v-model="deleteDialog.deleteInstance"
            class="mt-2"
            color="warning"
            hide-details
            label="Also delete service instance after unbind">
          </v-checkbox>
        </template>
      </confirm-dialog>

      <v-row justify="end">
        <v-col cols="3">
          <v-text-field label="Filtrer" density="compact" v-model="filters.text" clearable hide-details></v-text-field>
        </v-col>

        <v-col cols="auto">
          <v-btn variant="text" @click="loadData" size="large">
            <v-icon>mdi-cached</v-icon>
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn variant="text" @click="cycleCardsPerRow" size="large">
            <v-icon>{{ cardsPerRowIcon }}</v-icon>
            <v-tooltip activator="parent" location="bottom">Cards per row: {{ cardsPerRow }}</v-tooltip>
          </v-btn>
        </v-col>

        <v-col cols="auto">{{ filteredServices.length }}/{{ services.resources.length }}</v-col>
      </v-row>

      <v-row>
        <v-col cols="12" :md="cardCols" v-for="service in filteredServices" :key="`application-${service.guid}`">
          <service-card-item
            :service="service"
            :deleting="deletingBindingGuid === service.binding.guid"
            @open="openService(service)"
            @delete="requestDeleteService(service)">
          </service-card-item>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
