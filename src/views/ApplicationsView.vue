<script setup lang="ts">
import { computed, onActivated, ref, watch } from 'vue';
import applicationApi from '@/api/applications';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import useFilterData from '@/composables/useFilterData';
import useLoadData from '@/composables/useLoadData';
import { CFInclude } from '@/models/cf/common';
import { CFOrganization } from '@/models/cf/organization';
import { CFSpace } from '@/models/cf/space';
import { RouteNames } from '@/router';
import { distinct } from '@/utils/array';

const { data, response, loadData, loading } = useLoadData(() =>
  applicationApi.getAll({ includes: [CFInclude.SPACE, CFInclude.SPACE_ORGANIZATION] }),
);

onActivated(loadData);

const applications = computed(() => {
  if (!data.value) return [];

  const { resources, included } = data.value;

  return resources.map((application) => {
    const space = included?.spaces?.find(({ guid }) => guid === application.relationships.space.data.guid);
    const organization =
      space && included?.organizations?.find(({ guid }) => guid === space.relationships.organization.data.guid);
    return { ...application, space, organization };
  });
});

const organizationFilter = ref<CFOrganization['guid']>();
const organizations = computed(() =>
  distinct(
    applications.value.map((application) => ({
      name: application.organization?.name,
      guid: application.organization?.guid,
    })),
    (organization) => organization?.guid,
  ),
);

const spaceFilter = ref<CFSpace['guid']>();
const spaces = computed(() =>
  distinct(
    applications.value
      .map((application) => ({
        name: application.space?.name,
        guid: application.space?.guid,
        organizationGuid: application.space?.relationships.organization.data.guid,
      }))
      .filter((space) => {
        const orgFilter = organizationFilter.value;
        return !orgFilter || space?.organizationGuid === orgFilter;
      }),
    (space) => space?.guid,
  ),
);

watch(organizationFilter, () => {
  spaceFilter.value = spaces.value.length === 1 ? spaces.value[0]?.guid : undefined;
});

const { filters, computedData: filteredApplications } = useFilterData((filters, { includesText }) => {
  const organization = organizationFilter.value;
  const space = spaceFilter.value;

  return applications.value.filter((application) => {
    return (
      (!organization || application.organization?.guid === organization) &&
      (!space || application.space?.guid === space) &&
      (!filters.text || includesText(application.name, application.space?.name, application.organization?.name))
    );
  });
});
</script>

<template>
  <v-container fluid>
    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <template v-if="response">
      <v-row v-if="!response.success">
        <v-col><api-error-alert :error="response.error"></api-error-alert></v-col>
      </v-row>

      <template v-else flat>
        <v-row>
          <v-col>
            <v-select
              label="Organisation"
              density="compact"
              v-model="organizationFilter"
              :items="organizations"
              item-title="name"
              item-value="guid">
              <template #prepend-item>
                <v-list-item title="Aucune" @click="organizationFilter = undefined"></v-list-item>
              </template>
            </v-select>
          </v-col>
          <v-col>
            <v-select
              label="Space"
              density="compact"
              v-model="spaceFilter"
              :items="spaces"
              item-title="name"
              item-value="guid"
              single-line>
              <template #prepend-item>
                <v-list-item title="Aucun" @click="organizationFilter = undefined"></v-list-item>
              </template>
            </v-select>
          </v-col>
          <v-col>
            <v-text-field label="Filtrer" density="compact" v-model="filters.text"></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="3" v-for="application in filteredApplications" :key="`application-${application.guid}`">
            <v-card :to="{ name: RouteNames.APPLICATION, params: { guid: application.guid } }">
              <v-progress-linear :color="application.state === 'STARTED' ? 'success' : 'warning'" model-value="100">
              </v-progress-linear>

              <v-card-title>{{ application.name }}</v-card-title>

              <v-card-text>
                <v-row class="justify-space-between">
                  <v-col cols="auto">{{ application.updated_at }}</v-col>
                </v-row>

                <v-row class="justify-space-between">
                  <v-col cols="auto">Org/Space</v-col>
                  <v-col class="text-end">
                    <router-link
                      v-if="application.organization"
                      :to="{ name: RouteNames.ORGANIZATION, params: { guid: application.organization.guid } }">
                      {{ application.organization.name }}
                    </router-link>
                    /
                    <router-link
                      @click.stop
                      v-if="application.space"
                      :to="{ name: RouteNames.SPACE, params: { guid: application.space.guid } }">
                      {{ application.space.name }}
                    </router-link>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </template>
  </v-container>
</template>
