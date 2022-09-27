<script setup lang="ts">
import useFilterData from '@/composables/useFilterData';
import { CFEnvironmentVariables } from '@/models/cf/environment';

const props = defineProps<{
  environment: CFEnvironmentVariables;
}>();

const { filters, computedData: filteredVariables } = useFilterData((filters, { includesText }) => {
  return Object.entries(props.environment.environment_variables).filter(([key, value]) => {
    return !filters.text || includesText(key, value);
  });
});
</script>

<template>
  <v-card>
    <v-toolbar>
      <v-toolbar-title>Variables d'environnement</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-text-field label="Filtre" density="compact" v-model="filters.text" solo hide-details clearable></v-text-field>
    </v-toolbar>

    <v-row>
      <v-col>
        <v-table density="compact">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="[key, value] in filteredVariables">
              <td>{{ key }}</td>
              <td>{{ value }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
  </v-card>
</template>
