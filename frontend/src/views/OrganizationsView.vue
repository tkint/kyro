<script setup lang="ts">
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import OrganizationItem from '@/components/organization/OrganizationItem.vue';
import useOrganizations from '@/composables/useOrganizations';
import { onActivated } from 'vue';

const { loading, filters, filteredData, error, fetchData } = useOrganizations();

onActivated(fetchData);
</script>

<template>
  <v-container fluid>
    <v-progress-linear v-if="loading" indeterminate color="primary"> </v-progress-linear>

    <v-row v-if="error">
      <v-col>
        <api-error-alert :error="error"></api-error-alert>
      </v-col>
    </v-row>

    <template v-else>
      <v-row>
        <v-col></v-col>

        <v-col></v-col>

        <v-col>
          <v-text-field label="Filtrer" density="compact" v-model="filters.text" clearable></v-text-field>
        </v-col>

        <v-col cols="auto">
          <v-btn variant="text" @click="fetchData" size="large">
            <v-icon>mdi-cached</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="3" v-for="organization in filteredData" :key="`organization-${organization.guid}`">
          <organization-item :organization="organization"></organization-item>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>
