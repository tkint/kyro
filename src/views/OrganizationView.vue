<script lang="ts">
export default {
  name: componentNameFor(RouteNames.ORGANIZATION),
};
</script>

<script setup lang="ts">
import { onActivated } from 'vue';
import organizationApi from '@/api/organization';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import Organization from '@/components/organization/Organization.vue';
import useLoadData from '@/composables/useLoadData';
import { onCachedActivated } from '@/hooks';
import { CFOrganization } from '@/models/cf/organization';
import { componentNameFor, RouteNames } from '@/router';

const props = defineProps<{
  guid: CFOrganization['guid'];
}>();

const { response, loadData, error, loading, resetData } = useLoadData(() => organizationApi.getOne(props.guid));

onCachedActivated(
  () => props.guid,
  (invalidate) => {
    if (invalidate) {
      resetData();
    }
    loadData();
  },
);
</script>

<template>
  <v-container fluid>
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <v-row
      ><v-col><api-error-alert v-if="error" :error="error"></api-error-alert></v-col
    ></v-row>

    <v-row v-if="response?.success">
      <v-col>
        <organization :organization="response.data"></organization>
      </v-col>
    </v-row>
  </v-container>
</template>
