<script setup lang="ts">
import { ApiErrorResponse, compactErrors } from '@/api';
import organizationApi from '@/api/organization';
import serviceApi from '@/api/service';
import spaceApi from '@/api/space';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import ServiceInstanceCardItem from '@/components/services/ServiceInstanceCardItem.vue';
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue';
import { usePaginatedApiCall } from '@/composables/useApiCall';
import useFilterData from '@/composables/useFilterData';
import useLoadingFn from '@/composables/useLoadingFn';
import usePagination from '@/composables/usePagination';
import { CFOrganization } from '@/models/cf/organization';
import { CFServiceInstance } from '@/models/cf/service';
import { CFSpace } from '@/models/cf/space';
import { map, sortBy, uniq } from 'lodash';
import { computed, onActivated, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

type RelatedResource = {
  guid: string;
  name: string;
};

type ServiceWithContext = CFServiceInstance & { space?: RelatedResource; organization?: RelatedResource };

const { t } = useI18n();

const {
  data: servicesData,
  result: servicesResult,
  execute: loadServices,
  loading: loadingServices,
  reset: resetServices,
} = usePaginatedApiCall((page: number) => serviceApi.getAllInstances({ page, perPage: 50 }));
const {
  data: spacesData,
  result: spacesResult,
  execute: loadSpaces,
  loading: loadingSpaces,
  reset: resetSpaces,
} = usePaginatedApiCall((page: number) => spaceApi.getAll({ page, perPage: 200 }));
const {
  data: organizationsData,
  result: organizationsResult,
  execute: loadOrganizations,
  loading: loadingOrganizations,
  reset: resetOrganizations,
} = usePaginatedApiCall((page: number) => organizationApi.getAll({ page, perPage: 200 }));

const route = useRoute();
const loading = computed(() => loadingServices.value || loadingSpaces.value || loadingOrganizations.value);
const servicesError = computed(() => (!servicesResult.value?.success ? servicesResult.value?.error : undefined));
const spacesError = computed(() => (!spacesResult.value?.success ? spacesResult.value?.error : undefined));
const organizationsError = computed(() =>
  !organizationsResult.value?.success ? organizationsResult.value?.error : undefined,
);
const error = computed(() => compactErrors(servicesError.value, spacesError.value, organizationsError.value));
const hasLoaded = computed(
  () => !!servicesResult.value && !!spacesResult.value && !!organizationsResult.value && !loading.value,
);

const forceReloadServices = () => {
  resetServices();
  resetSpaces();
  resetOrganizations();
  loadServices();
  loadSpaces();
  loadOrganizations();
};

onActivated(forceReloadServices);
watch(
  () => route.query.refresh,
  () => {
    forceReloadServices();
  },
);

const organizationFilter = ref<CFOrganization['guid']>();
const organizationsByGuid = computed(
  () => new Map((organizationsData.value?.resources ?? []).map((org) => [org.guid, org])),
);
const spacesByGuid = computed(() => new Map((spacesData.value?.resources ?? []).map((space) => [space.guid, space])));

const services = computed<ServiceWithContext[]>(() =>
  (servicesData.value?.resources ?? []).map((service) => {
    const space = spacesByGuid.value.get(service.relationships.space.data.guid);
    const organization = space ? organizationsByGuid.value.get(space.relationships.organization.data.guid) : undefined;

    return {
      ...service,
      space: space && {
        name: space.name,
        guid: space.guid,
      },
      organization: organization && {
        name: organization.name,
        guid: organization.guid,
      },
    };
  }),
);

const organizations = computed(() => {
  const orgGuids = uniq(services.value.map((service) => service.organization?.guid).filter((item): item is string => !!item));
  return sortBy(
    orgGuids
      .map((guid) => organizationsByGuid.value.get(guid))
      .filter((item): item is CFOrganization => !!item),
    (item) => item.name,
  );
});

const spaceFilter = ref<CFSpace['guid']>();
const spaces = computed(() => {
  if (!spacesData.value?.resources) {
    return [];
  }

  const referencedSpaceGuids = new Set(services.value.map((service) => service.space?.guid).filter((item): item is string => !!item));
  const filteredSpaces = spacesData.value.resources.filter((space) => {
    const orgFilter = organizationFilter.value;
    return referencedSpaceGuids.has(space.guid) && (!orgFilter || space.relationships.organization.data.guid === orgFilter);
  });

  return sortBy(
    map(filteredSpaces, (space) => {
      let displayName: string;

      if (filteredSpaces.filter((s) => s.name === space.name).length > 1) {
        const organization = organizations.value.find((org) => org.guid === space.relationships.organization.data.guid);

        displayName = `${space.name} (${organization?.name ?? '--'})`;
      } else {
        displayName = space.name;
      }

      return { ...space, displayName };
    }),
    (item) => item.displayName,
  );
});

watch(
  organizationFilter,
  () => {
    spaceFilter.value = spaces.value.length === 1 ? spaces.value[0]?.guid : undefined;
  },
  { flush: 'post' },
);

const { filters, data: filteredServices } = useFilterData((filters, { includesText }) => {
  const organization = organizationFilter.value;
  const space = spaceFilter.value;

  return services.value.filter((service) => {
    return (
      (!organization || service.organization?.guid === organization) &&
      (!space || service.space?.guid === space) &&
      (!filters.text || includesText(service.name, service.space?.name, service.organization?.name))
    );
  });
});

const { data: paginatedServices, pagination } = usePagination(filteredServices, { perPage: 20 });
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

const deletingGuid = ref<CFServiceInstance['guid']>();
const deletingError = ref<ApiErrorResponse>();
const deleteDialog = ref<{ opened: boolean; service?: ServiceWithContext }>({ opened: false, service: undefined });
const askDelete = (service: ServiceWithContext) => {
  deleteDialog.value = { opened: true, service };
};

const wait = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs));
const waitForServiceDeletion = async (serviceGuid: CFServiceInstance['guid']) => {
  for (let i = 0; i < 20; i++) {
    const current = await serviceApi.getInstances([serviceGuid]);
    if (!current.success) {
      break;
    }

    const exists = current.data.resources.some((service) => service.guid === serviceGuid);
    if (!exists) {
      return;
    }

    await wait(1000);
  }
};

const { fn: confirmDeleteService, loading: deleting } = useLoadingFn(async () => {
  const service = deleteDialog.value.service;
  if (!service) return;

  deletingError.value = undefined;
  deletingGuid.value = service.guid;
  const result = await serviceApi.deleteInstance(service.guid);
  if (result.success) {
    await waitForServiceDeletion(service.guid);
    deleteDialog.value = { opened: false, service: undefined };
    forceReloadServices();
  } else {
    deletingError.value = result.error;
  }
  deletingGuid.value = undefined;
});
</script>

<template>
  <v-container fluid>
    <v-progress-linear indeterminate :color="loading ? 'primary' : 'transparent'" class="mb-1"></v-progress-linear>

    <template v-if="hasLoaded || error">
      <v-row v-if="error">
        <v-col><api-error-alert :error="error"></api-error-alert></v-col>
      </v-row>

      <template v-else-if="hasLoaded">
        <v-row v-if="deletingError">
          <v-col><api-error-alert :error="deletingError"></api-error-alert></v-col>
        </v-row>

        <confirm-dialog v-model="deleteDialog.opened" @confirm="confirmDeleteService" :loading="deleting">
          <template #text>Delete service instance `{{ deleteDialog.service?.name }}`?</template>
        </confirm-dialog>

        <v-row align="center">
          <v-col>
            <v-select
              :label="t('service.filter.organization')"
              density="compact"
              v-model="organizationFilter"
              :items="organizations"
              item-title="name"
              item-value="guid"
              clearable
              hide-details>
            </v-select>
          </v-col>

          <v-col>
            <v-select
              :label="t('service.filter.space')"
              density="compact"
              v-model="spaceFilter"
              :items="spaces"
              item-title="displayName"
              item-value="guid"
              clearable
              hide-details>
            </v-select>
          </v-col>

          <v-col>
            <v-text-field
              :label="t('service.filter.text')"
              density="compact"
              v-model="filters.text"
              clearable
              hide-details>
            </v-text-field>
          </v-col>

          <v-col cols="auto">
            <v-btn variant="text" @click="forceReloadServices" size="large">
              <v-icon>mdi-cached</v-icon>
            </v-btn>
          </v-col>

          <v-col cols="auto">
            <v-btn variant="text" @click="cycleCardsPerRow" size="large">
              <v-icon>{{ cardsPerRowIcon }}</v-icon>
              <v-tooltip activator="parent" location="bottom">Cards per row: {{ cardsPerRow }}</v-tooltip>
            </v-btn>
          </v-col>

          <v-col cols="auto">{{ filteredServices.length }}/{{ services.length }}</v-col>
        </v-row>

        <template v-if="paginatedServices.length > 0">
          <v-row>
            <v-col cols="12" :md="cardCols" v-for="service in paginatedServices" :key="`service-${service.guid}`">
              <service-instance-card-item
                :service="service"
                :deleting="deletingGuid === service.guid"
                @delete="askDelete(service)">
              </service-instance-card-item>
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <v-pagination v-model="pagination.page" :length="pagination.pages"></v-pagination>
            </v-col>
          </v-row>
        </template>

        <v-alert class="mt-2" color="warning" variant="outlined" icon="$warning" v-else-if="!loading">
          No service found
        </v-alert>
      </template>
    </template>
  </v-container>
</template>
