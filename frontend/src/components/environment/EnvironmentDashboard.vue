<script setup lang="ts">
import environmentApi from '@/api/environment';
import EnvironmentVariableForm from '@/components/environment/EnvironmentVariableForm.vue';
import useApiCall from '@/composables/useApiCall';
import useApplicationContext from '@/composables/useApplicationContext';
import useFilterData from '@/composables/useFilterData';
import { EnvironmentVariableInput } from '@/models/environment';
import { computed, ref, unref, watch } from 'vue';

const context = useApplicationContext();
const application = computed(() => context.application.value);

const {
  data,
  error,
  execute: loadData,
  reset: resetData,
} = useApiCall(() => environmentApi.getForApplication(context.guid.value), context.loading);
loadData();

context.on('reload', () => {
  loadData();
});
context.on('reset', () => {
  resetData();
});

watch(error, (newValue) => {
  if (newValue) {
    context.errors.value.push(newValue);
  }
});

const { filters, data: environmentVariables } = useFilterData((filters, { includesText }) => {
  const variables = unref(data)?.environment_variables;
  return variables
    ? Object.entries(variables).filter(([key, value]) => {
        return !filters.text || includesText(key, value);
      })
    : [];
});

const editingVariable = ref<EnvironmentVariableInput>();
const variableFormDialog = ref(false);
const openVariableFormDialog = (value?: EnvironmentVariableInput) => {
  if (value) {
    editingVariable.value = value;
  } else {
    editingVariable.value = undefined;
  }
  variableFormDialog.value = true;
};
const handleVariableFormSubmit = async (newValue: EnvironmentVariableInput) => {
  const { guid: appGuid } = unref(application);
  await environmentApi.setVariableForApplication(appGuid, newValue);
  variableFormDialog.value = false;
  loadData();
};

const deletingVariableKey = ref<string>();
const handleVariableDeleteSubmit = async () => {
  const { guid: appGuid } = unref(application);
  if (deletingVariableKey.value) {
    await environmentApi.unsetVariableForApplication(appGuid, deletingVariableKey.value);
    deletingVariableKey.value = undefined;
    loadData();
  }
};
</script>

<template>
  <v-row class="flex-column" v-if="data">
    <v-dialog v-model="variableFormDialog" width="500">
      <environment-variable-form :initial-input="editingVariable" @submit="handleVariableFormSubmit">
      </environment-variable-form>
    </v-dialog>

    <v-dialog :model-value="!!deletingVariableKey" @update:model-value="deletingVariableKey = undefined" width="500">
      <v-card>
        <v-card-text>Supprimer la variable `{{ deletingVariableKey }}` ?</v-card-text>

        <v-card-actions>
          <v-btn color="danger" @click="handleVariableDeleteSubmit">Oui</v-btn>
          <v-btn color="secondary" @click="deletingVariableKey = undefined">Non</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-col>
      <v-card>
        <v-toolbar density="compact">
          <v-toolbar-title>Variables d'environnement</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-text-field label="Filtre" density="compact" v-model="filters.text" solo hide-details clearable>
          </v-text-field>

          <v-btn variant="text" size="large" @click="openVariableFormDialog()">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-toolbar>

        <v-row>
          <v-col>
            <v-table density="compact" hover>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="[key, value] in environmentVariables"
                  :key="`variable-${key}`"
                  style="cursor: pointer"
                  @click="openVariableFormDialog({ key, value })">
                  <td>{{ key }}</td>
                  <td>{{ value }}</td>
                  <td>
                    <v-btn variant="text" size="large" @click.stop="deletingVariableKey = key">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
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
          {{ data.system_env_json }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col>
      <v-card>
        <v-toolbar density="compact">
          <v-toolbar-title>Variables d'application</v-toolbar-title>
        </v-toolbar>

        <v-card-text style="white-space: pre; overflow-x: auto">
          {{ data.application_env_json }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col>
      <v-card>
        <v-toolbar density="compact">
          <v-toolbar-title>Variables de déploiement</v-toolbar-title>
        </v-toolbar>

        <v-card-text style="white-space: pre; overflow-x: auto">
          {{ data.staging_env_json }}
        </v-card-text>
      </v-card>
    </v-col>

    <v-col>
      <v-card>
        <v-toolbar density="compact">
          <v-toolbar-title>Variables d'exécution</v-toolbar-title>
        </v-toolbar>

        <v-card-text style="white-space: pre; overflow-x: auto">
          {{ data.running_env_json }}
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
