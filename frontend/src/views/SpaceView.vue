<script setup lang="ts">
import spaceApi from '@/api/space';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import Space from '@/components/space/Space.vue';
import useApiCall from '@/composables/useApiCall';
import { onCachedActivated } from '@/hooks';
import { CFSpace } from '@/models/cf/space';

const props = defineProps<{
  guid: CFSpace['guid'];
}>();

const { result, execute: loadData, error, loading, reset: resetData } = useApiCall(() => spaceApi.getOne(props.guid));

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

    <v-row v-if="error">
      <v-col>
        <api-error-alert :error="error"></api-error-alert>
      </v-col>
    </v-row>

    <v-row v-if="result?.success">
      <v-col>
        <space :space="result.data"></space>
      </v-col>
    </v-row>
  </v-container>
</template>
