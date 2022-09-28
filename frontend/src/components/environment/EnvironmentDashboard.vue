<script setup lang="ts">
import useFilterData from '@/composables/useFilterData';
import { CFEnvironmentVariables } from '@/models/cf/environment';

const props = defineProps<{
  environment: CFEnvironmentVariables;
}>();

const { filters, computedData: environmentVariables } = useFilterData((filters, { includesText }) => {
  const { environment_variables } = props.environment;
  return environment_variables
    ? Object.entries(environment_variables).filter(([key, value]) => {
        return !filters.text || includesText(key, value);
      })
    : [];
});
</script>

<template>
  <v-row class="flex-column">
    <v-col>
      <v-card>
        <v-toolbar density="compact">
          <v-toolbar-title>Variables d'environnement</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-text-field label="Filtre" density="compact" v-model="filters.text" solo hide-details clearable>
          </v-text-field>
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
                <tr v-for="[key, value] in environmentVariables">
                  <td>{{ key }}</td>
                  <td>{{ value }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <v-col>
      <v-card>
        <v-toolbar density="compact">
          <v-toolbar-title>Variables système</v-toolbar-title>
        </v-toolbar>

        <v-card-text style="white-space: pre; overflow-x: auto">
          {{ environment.system_env_json }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col>
      <v-card>
        <v-toolbar density="compact">
          <v-toolbar-title>Variables d'application</v-toolbar-title>
        </v-toolbar>

        <v-card-text style="white-space: pre; overflow-x: auto">
          {{ environment.application_env_json }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col>
      <v-card>
        <v-toolbar density="compact">
          <v-toolbar-title>Variables de déploiement</v-toolbar-title>
        </v-toolbar>

        <v-card-text style="white-space: pre; overflow-x: auto">
          {{ environment.staging_env_json }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col>
      <v-card>
        <v-toolbar density="compact">
          <v-toolbar-title>Variables d'exécution</v-toolbar-title>
        </v-toolbar>

        <v-card-text style="white-space: pre; overflow-x: auto">
          {{ environment.running_env_json }}
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
