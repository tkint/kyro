<script setup lang="ts">
import applicationApi from '@/api/application';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import ApplicationItem from '@/components/application/ApplicationItem.vue';
import { usePaginatedApiCall } from '@/composables/useApiCall';
import useFilterData from '@/composables/useFilterData';
import usePagination from '@/composables/usePagination';
import { CFInclude, mapResources } from '@/models/cf/common';
import { CFOrganization } from '@/models/cf/organization';
import { CFSpace } from '@/models/cf/space';
import { flatOnSuccess } from '@/utils/result';
import { map, sortBy } from 'lodash';
import { computed, onActivated, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const {
  data: applications,
  result,
  execute: loadApplications,
  loading,
} = usePaginatedApiCall((page: number) =>
  applicationApi
    .getAll({
      includes: [CFInclude.SPACE, CFInclude.SPACE_ORGANIZATION],
      page: page,
      perPage: 20,
    })
    .then((result) =>
      flatOnSuccess(result, (data) => {
        const { included } = data;

        return mapResources(data, (application) => {
          const space = included?.spaces?.find(({ guid }) => guid === application.relationships.space.data.guid);
          const organization =
            space && included?.organizations?.find(({ guid }) => guid === space.relationships.organization.data.guid);

          return {
            ...application,
            space: space && {
              name: space.name,
              guid: space.guid,
            },
            organization: organization && {
              name: organization.name,
              guid: organization.guid,
            },
          };
        });
      }),
    ),
);

onActivated(loadApplications);

const organizationFilter = ref<CFOrganization['guid']>();
const organizations = computed(() => sortBy(applications.value?.included?.organizations, (item) => item.name));

const spaceFilter = ref<CFSpace['guid']>();
const spaces = computed(() => {
  if (!applications.value?.included?.spaces) {
    return [];
  }

  const filteredSpaces = applications.value.included.spaces?.filter((space) => {
    const orgFilter = organizationFilter.value;
    return !orgFilter || space.relationships.organization.data.guid === orgFilter;
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

const { filters, data: filteredApplications } = useFilterData((filters, { includesText }) => {
  const organization = organizationFilter.value;
  const space = spaceFilter.value;

  return applications.value?.resources.filter((application) => {
    return (
      (!organization || application.organization?.guid === organization) &&
      (!space || application.space?.guid === space) &&
      (!filters.text || includesText(application.name, application.space?.name, application.organization?.name))
    );
  });
});

const { data: paginatedApplications, pagination } = usePagination(filteredApplications, { perPage: 20 });
</script>

<template>
  <v-container fluid>
    <v-progress-linear indeterminate :color="loading ? 'primary' : 'transparent'" class="mb-1"></v-progress-linear>

    <template v-if="result">
      <v-row v-if="!result.success">
        <v-col><api-error-alert :error="result.error"></api-error-alert></v-col>
      </v-row>

      <template v-else>
        <v-row align="center">
          <v-col>
            <v-select
              :label="t('application.filter.organization')"
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
              :label="t('application.filter.space')"
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
              :label="t('application.filter.text')"
              density="compact"
              v-model="filters.text"
              clearable
              hide-details>
            </v-text-field>
          </v-col>

          <v-col cols="auto">
            <v-btn variant="text" @click="loadApplications" size="large">
              <v-icon>mdi-cached</v-icon>
            </v-btn>
          </v-col>

          <v-col cols="auto">{{ filteredApplications.length }}/{{ applications?.resources.length }}</v-col>
        </v-row>

        <template v-if="paginatedApplications.length > 0">
          <v-row>
            <v-col cols="3" v-for="application in paginatedApplications" :key="`application-${application.guid}`">
              <application-item :application="application"></application-item>
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <v-pagination v-model="pagination.page" :length="pagination.pages"></v-pagination>
            </v-col>
          </v-row>
        </template>

        <v-alert class="mt-2" color="warning" variant="outlined" icon="$warning" v-else-if="!loading">
          No application found
        </v-alert>
      </template>
    </template>
  </v-container>
</template>
