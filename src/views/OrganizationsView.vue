<script lang="ts">
export default {
  name: componentNameFor(RouteNames.ORGANIZATIONS),
};
</script>

<script setup lang="ts">
import { onActivated } from 'vue';
import organizationApi from '@/api/organization';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import useFilterData from '@/composables/useFilterData';
import useLoadData from '@/composables/useLoadData';
import { componentNameFor, RouteNames } from '@/router';

const { data, response, loadData, loading } = useLoadData(() => organizationApi.getAll());

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
      <v-row v-if="!response.success"
        ><v-col> <api-error-alert :error="response.error"></api-error-alert> </v-col
      ></v-row>

      <template v-else>
        <v-row
          ><v-col><v-text-field label="Filtrer" v-model="filters.text"></v-text-field></v-col
        ></v-row>

        <v-row
          ><v-col cols="3" v-for="organization in filteredOrganizations" :key="`organization-${organization.guid}`">
            <v-card :to="{ name: RouteNames.ORGANIZATION, params: { guid: organization.guid } }">
              <v-card-title>{{ organization.name }}</v-card-title>

              <!-- <v-card-text>{{ organization }}</v-card-text> -->
            </v-card>
          </v-col></v-row
        >
      </template>
    </template>
  </v-container>
</template>
