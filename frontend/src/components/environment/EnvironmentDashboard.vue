<script setup lang="ts">
import EnvironmentTable from '@/components/environment/EnvironmentTable.vue';
import { CFEnvironmentVariables } from '@/models/cf/environment';

const props = defineProps<{
  environment: CFEnvironmentVariables;
}>();
</script>

<template>
  <v-row v-if="environment">
    <v-col>
      <environment-table :environment="environment"></environment-table>
    </v-col>
  </v-row>
</template>
