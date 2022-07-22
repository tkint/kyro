<script lang="ts">
export default {
  name: componentNameFor(RouteNames.APPLICATIONS),
};
</script>

<script setup lang="ts">
import { onActivated } from 'vue';
import { useRouter } from 'vue-router';
import applicationsApi from '@/api/applications';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import useFilterData from '@/composables/useFilterData';
import useLoadData from '@/composables/useLoadData';
import { CFApplication } from '@/models/cf/application';
import { componentNameFor, RouteNames } from '@/router';

const router = useRouter();

const { data, response, loadData, loading } = useLoadData(() => applicationsApi.getAll());

onActivated(loadData);

const fields: {
  key: keyof CFApplication;
  label: string;
  value: (app: CFApplication) => any;
}[] = [
  { key: 'name', label: 'Name', value: (app) => app.name },
  { key: 'state', label: 'State', value: (app) => app.state },
];

const openApplication = async (guid: CFApplication['guid']) => {
  await router.push({ name: RouteNames.APPLICATION, params: { guid } });
};

const { filters, filteredData: filteredApplications } = useFilterData((filters, { includesText }) => {
  return data.value?.resources.filter((application) => {
    return !filters.text || includesText(application.name);
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
          ><v-col>
            <v-table v-if="filteredApplications">
              <thead>
                <tr>
                  <td v-for="(header, headerKey) in fields" :key="`header-${headerKey}`">
                    {{ header?.label }}
                  </td>
                </tr>
              </thead>

              <tbody>
                <tr
                  style="cursor: pointer"
                  v-for="application in filteredApplications"
                  :key="`application-${application.guid}`"
                  @click="openApplication(application.guid)">
                  <td v-for="field in fields" :key="`application-${application.guid}-field-${field.key}`">
                    {{ application[field.key] }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-col></v-row
        >
      </template>
    </template>
  </v-container>
</template>
