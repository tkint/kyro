<script lang="ts">
export default {
  name: componentNameFor(RouteNames.SPACE),
};
</script>

<script setup lang="ts">
import spaceApi from '@/api/space';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import Space from '@/components/space/Space.vue';
import useLoadData from '@/composables/useLoadData';
import { onCachedActivated } from '@/hooks';
import { CFSpace } from '@/models/cf/space';
import { componentNameFor, RouteNames } from '@/router';

const props = defineProps<{
  guid: CFSpace['guid'];
}>();

const { response, loadData, error, loading, resetData } = useLoadData(() => spaceApi.getOne(props.guid));

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
        <space :space="response.data"></space>
      </v-col>
    </v-row>
  </v-container>
</template>
