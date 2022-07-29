<script setup lang="ts">
import { onActivated, ref } from 'vue';
import { buildApiErrorResponse, compactErrors } from '@/api';
import organizationApi from '@/api/organization';
import organizationQuotaApi from '@/api/organizationQuota';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import OrganizationItem from '@/components/organization/OrganizationItem.vue';
import useFilterData from '@/composables/useFilterData';
import useLoadData from '@/composables/useLoadData';

const loading = ref(false);

const { data, response, loadData } = useLoadData(async () => {
  const [organizations, quotas] = await Promise.all([organizationApi.getAll(), organizationQuotaApi.getAll()]);

  if (organizations.success && quotas.success) {
    const finalData = {
      pagination: organizations.data.pagination,
      resources: organizations.data.resources.map((organization) => ({
        ...organization,
        quota: quotas.data.resources.find((quota) => quota.guid === organization.relationships.quota.data.guid),
      })),
    };
    return { success: true, data: finalData };
  } else {
    const error =
      compactErrors(!organizations.success && organizations.error, !quotas.success && quotas.error) ??
      buildApiErrorResponse();

    return { success: false, error: error };
  }
}, loading);

onActivated(loadData);

const { filters, computedData: filteredOrganizations } = useFilterData((filters, { includesText }) => {
  return data.value?.resources.filter((organization) => {
    return !filters.text || includesText(organization.name);
  });
});
</script>

<template>
  <v-container fluid>
    <v-progress-linear v-if="loading" indeterminate color="primary"> </v-progress-linear>

    <template v-if="response">
      <v-row v-if="!response.success">
        <v-col>
          <api-error-alert :error="response.error"></api-error-alert>
        </v-col>
      </v-row>

      <template v-else>
        <v-row>
          <v-col></v-col>
          <v-col></v-col>
          <v-col>
            <v-text-field label="Filtrer" density="compact" v-model="filters.text"></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="3" v-for="organization in filteredOrganizations" :key="`organization-${organization.guid}`">
            <organization-item :organization="organization"></organization-item>
          </v-col>
        </v-row>
      </template>
    </template>
  </v-container>
</template>
