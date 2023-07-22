<script setup lang="ts">
import organizationApi from '@/api/organization';
import organizationQuotaApi from '@/api/organizationQuota';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import OrganizationItem from '@/components/organization/OrganizationItem.vue';
import useFilterData from '@/composables/useFilterData';
import { useLoadPaginatedData } from '@/composables/useLoadData';
import usePagination from '@/composables/usePagination';
import { mapResources } from '@/models/cf/common';
import { onSuccess, successOf } from '@/utils/result';
import { filter, map } from 'lodash';
import { onActivated } from 'vue';

const { data, response, loadData, loading } = useLoadPaginatedData(async (page) => {
  const result = await organizationApi
    .getAll({ page })
    .then((result) =>
      onSuccess(result, ({ resources }) => organizationQuotaApi.getAll({ organizationGuids: map(resources, 'guid') })),
    );

  if (result.success) {
    const [organizations, quotas] = result.data;

    return successOf(
      mapResources(organizations, (organization) => {
        const quota = quotas.resources.find((quota) => quota.guid === organization.relationships.quota.data.guid);

        return {
          ...organization,
          quota,
        };
      }),
    );
  }

  return result;
});

const { filters, data: filteredData } = useFilterData((_, { includesText }) =>
  filter(data.value?.resources, (organization) => includesText(organization.name)),
);

const { data: paginatedData, pagination } = usePagination(filteredData, { perPage: 20 });

onActivated(loadData);
</script>

<template>
  <v-container fluid>
    <v-progress-linear indeterminate :color="loading ? 'primary' : 'transparent'" class="mb-1"></v-progress-linear>

    <template v-if="response">
      <v-row v-if="!response.success">
        <v-col>
          <api-error-alert :error="response.error"></api-error-alert>
        </v-col>
      </v-row>

      <template v-else>
        <v-row align="center" justify="end">
          <v-col cols="4">
            <v-text-field label="Filtrer" density="compact" v-model="filters.text" clearable hide-details>
            </v-text-field>
          </v-col>

          <v-col cols="auto">
            <v-btn variant="text" @click="loadData" size="large">
              <v-icon>mdi-cached</v-icon>
            </v-btn>
          </v-col>

          <v-col cols="auto">{{ filteredData.length }}/{{ response.data.resources.length }}</v-col>
        </v-row>

        <template v-if="paginatedData.length > 0">
          <v-row>
            <v-col cols="3" v-for="organization in paginatedData" :key="`organization-${organization.guid}`">
              <organization-item :organization="organization"></organization-item>
            </v-col>
          </v-row>

          <v-row>
            <v-col>
              <v-pagination v-model="pagination.page" :length="pagination.pages"></v-pagination>
            </v-col>
          </v-row>
        </template>

        <v-alert color="warning" variant="outlined" icon="$warning" v-else-if="!loading">No organization found</v-alert>
      </template>
    </template>
  </v-container>
</template>
