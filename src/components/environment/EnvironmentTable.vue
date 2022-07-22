<script setup lang="ts">
import useFilterData from '@/composables/useFilterData';
import { EnvironmentVariables } from '@/models/cf/environment';

const props = defineProps<{
  environment: EnvironmentVariables;
}>();

const { filters, filteredData: filteredVariables } = useFilterData((filters, { includesText }) => {
  return Object.entries(props.environment.var).filter(([key, value]) => {
    return !filters.text || includesText(key, value);
  });
});
</script>

<template>
  <v-col>
    <v-row>
      <v-col>
        <v-text-field label="Filtre" v-model="filters.text"></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-table>
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
  </v-col>
</template>
