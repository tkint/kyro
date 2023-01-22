<script setup lang="ts">
import { computed, onActivated, ref, watch } from 'vue';
import applicationApi from '@/api/application';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import ApplicationItem from '@/components/application/ApplicationItem.vue';
import useFilterData from '@/composables/useFilterData';
import useLoadData from '@/composables/useLoadData';
import { CFInclude } from '@/models/cf/common';
import { CFOrganization } from '@/models/cf/organization';
import { CFSpace } from '@/models/cf/space';
import { compare, range } from '@/utils/common';

const { data, response, loadData, loading } = useLoadData(async () => {
  const getPage = (page: number) =>
    applicationApi.getAll({
      includes: [CFInclude.SPACE, CFInclude.SPACE_ORGANIZATION],
      page: page,
      perPage: 100,
    });

  const firstPage = await getPage(1);

  if (!firstPage.success) return firstPage;

  const { total_pages } = firstPage.data.pagination;

  if (total_pages > 1) {
    (await Promise.all(range(2, total_pages).map((page) => getPage(page)))).forEach((pageResponse) => {
      if (pageResponse.success) {
        firstPage.data.resources.push(...pageResponse.data.resources);
      }
    });
  }

  return firstPage;
});

onActivated(loadData);

const applications = computed(() => {
  if (!data.value) return [];

  const { resources, included } = data.value;

  return resources.map((application) => {
    const space = included?.spaces?.find(({ guid }) => guid === application.relationships.space.data.guid);
    const organization =
      space && included?.organizations?.find(({ guid }) => guid === space.relationships.organization.data.guid);
    return {
      ...application,
      space: space && {
        name: space.name,
        guid: space.guid,
      },
      organization: organization && {
        name: organization.name,
        guid: organization.guid,
      },
    };
  });
});

const organizationFilter = ref<CFOrganization['guid']>();
const organizations = computed(() => data.value?.included?.organizations.sort((a, b) => compare(a.name, b.name)));

const spaceFilter = ref<CFSpace['guid']>();
const spaces = computed(
  () =>
    data.value?.included?.spaces
      ?.filter((space) => {
        const orgFilter = organizationFilter.value;
        return !orgFilter || space?.relationships.organization.data.guid === orgFilter;
      })
      .sort((a, b) => compare(a.name, b.name)) || [],
);

watch(
  organizationFilter,
  () => {
    spaceFilter.value = spaces.value.length === 1 ? spaces.value[0]?.guid : undefined;
  },
  { flush: 'post' },
);

const { filters, data: filteredApplications } = useFilterData((filters, { includesText }) => {
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

      <template v-else>
        <v-row>
          <v-col>
            <v-select
              label="Organisation"
              density="compact"
              v-model="organizationFilter"
              :items="organizations"
              item-title="name"
              item-value="guid"
              clearable>
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
              single-line
              clearable>
            </v-select>
          </v-col>

          <v-col>
            <v-text-field clearable label="Filtrer" density="compact" v-model="filters.text"></v-text-field>
          </v-col>

          <v-col cols="auto">
            <v-btn variant="text" @click="loadData" size="large">
              <v-icon>mdi-cached</v-icon>
            </v-btn>
          </v-col>

          <v-col cols="auto">{{ filteredApplications.length }}/{{ applications.length }}</v-col>
        </v-row>

        <v-row>
          <v-col cols="3" v-for="application in filteredApplications" :key="`application-${application.guid}`">
            <application-item :application="application"></application-item>
          </v-col>
        </v-row>
      </template>
    </template>
  </v-container>
</template>
