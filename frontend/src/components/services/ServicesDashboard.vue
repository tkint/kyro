<script setup lang="ts">
import serviceApi from '@/api/service';
import ServiceItem from '@/components/services/ServiceItem.vue';
import CopyableText from '@/components/shared/CopyableText.vue';
import useApplicationContext from '@/composables/useApplicationContext';
import useFilterData from '@/composables/useFilterData';
import useLoadData from '@/composables/useLoadData';
import { CFServiceBinding, CFServiceInstance } from '@/models/cf/service';
import { formatDate } from '@/utils/date';
import { ref } from 'vue';

type ServiceInstanceWithBinding = CFServiceInstance & { binding: CFServiceBinding };
type DialogState =
  | {
      opened: false;
      service: undefined;
    }
  | {
      opened: true;
      service: ServiceInstanceWithBinding & { details?: object };
    };

const context = useApplicationContext();

const {
  data: services,
  error: servicesError,
  loadData,
  resetData,
} = useLoadData(async () => {
  const bindings = await serviceApi.getBindingsForApplication(context.guid.value);
  if (bindings.success) {
    const serviceGuidToBinding = Object.fromEntries(
      bindings.data.resources.map((binding) => [binding.relationships.service_instance.data.guid, binding]),
    );

    const result = await serviceApi.getInstances(Object.keys(serviceGuidToBinding));
    if (result.success) {
      return {
        ...result,
        data: {
          ...result.data,
          resources: result.data.resources.map((service) => ({
            ...service,
            binding: serviceGuidToBinding[service.guid]!!,
          })),
        },
      };
    }
    return result;
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
  return services.value?.resources.filter((service) => {
    return !filters.text || includesText(service.name);
  });
});

const dialog = ref<DialogState>({ opened: false, service: undefined });
const openService = async (service: ServiceInstanceWithBinding) => {
  const details = await serviceApi.getBindingsDetails(service.binding.guid);

  dialog.value = {
    opened: true,
    service: {
      ...service,
      details: details.success ? details.data : undefined,
    },
  };
};
</script>

<template>
  <v-dialog v-model="dialog.opened" width="80%" scrollable>
    <v-card v-if="dialog.service">
      <v-card-title>{{ dialog.service.name }}</v-card-title>

      <v-card-text>
        <v-container class="px-0">
          <v-row>
            <v-col>
              <v-card>
                <v-card-title>Service</v-card-title>

                <v-card-text>
                  <v-row>
                    <v-col>
                      <div>Type</div>
                      <div>{{ dialog.service.type }}</div>
                    </v-col>

                    <v-col>
                      <div>Guid<copyable-text :text="dialog.service.guid"></copyable-text></div>
                      <div>{{ dialog.service.guid }}</div>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col>
                      <div>Création</div>
                      <div>{{ formatDate(dialog.service.created_at, 'DD/MM/YYYY HH:mm:ss') }}</div>
                    </v-col>

                    <v-col>
                      <div>Mise à jour</div>
                      <div>{{ formatDate(dialog.service.updated_at, 'DD/MM/YYYY HH:mm:ss') }}</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col class="text-no-wrap">
              <v-card>
                <v-card-title>Binding</v-card-title>

                <v-card-text>
                  <v-row>
                    <v-col>
                      <div>Type</div>
                      <div>{{ dialog.service.type }}</div>
                    </v-col>

                    <v-col>
                      <div>Guid<copyable-text :text="dialog.service.binding.guid"></copyable-text></div>
                      <div>{{ dialog.service.binding.guid }}</div>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col>
                      <div>Création</div>
                      <div>{{ formatDate(dialog.service.binding.created_at, 'DD/MM/YYYY HH:mm:ss') }}</div>
                    </v-col>

                    <v-col>
                      <div>Mise à jour</div>
                      <div>{{ formatDate(dialog.service.binding.updated_at, 'DD/MM/YYYY HH:mm:ss') }}</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <v-card>
                <v-card-title>Dernière opération</v-card-title>

                <v-card-text>
                  <v-row>
                    <v-col>
                      <div>Type</div>
                      <div>{{ dialog.service.last_operation.type }}</div>
                    </v-col>

                    <v-col>
                      <div>State</div>
                      <div>{{ dialog.service.last_operation.state }}</div>
                    </v-col>

                    <v-col>
                      <div>Création</div>
                      <div>{{ formatDate(dialog.service.last_operation.created_at, 'DD/MM/YYYY HH:mm:ss') }}</div>
                    </v-col>

                    <v-col>
                      <div>Mise à jour</div>
                      <div>{{ formatDate(dialog.service.last_operation.updated_at, 'DD/MM/YYYY HH:mm:ss') }}</div>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col>
                      <v-sheet>

                        {{ dialog.service.last_operation.description }}
                      </v-sheet>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row v-if="dialog.service.details">
            <v-col>
              <v-card>
                <v-card-title>Details</v-card-title>

                <v-card-text>
                  <v-code tag="pre">{{ JSON.stringify(dialog.service.details, null, 2) }}</v-code>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-row class="flex-column" v-if="services">
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

        <v-col cols="auto">{{ filteredServices.length }}/{{ services.resources.length }}</v-col>
      </v-row>

      <v-row>
        <v-col cols="3" v-for="service in filteredServices" :key="`application-${service.guid}`">
          <service-item :service="service" @click="openService(service)"></service-item>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
