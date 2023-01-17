<script setup lang="ts">
import { computed } from 'vue';
import { PaginatedOrganizations } from '@/models/cf/organization';
import { PaginatedOrganizationQuotas } from '@/models/cf/organizationQuota';
import { RouteNames } from '@/router';
import { formatDate } from '@/utils/date';
import { convertMemory, MemoryUnit } from '@/utils/number';

const props = defineProps<{
  organization: PaginatedOrganizations['resources'][0] & { quota?: PaginatedOrganizationQuotas['resources'][0] };
}>();

const memory = computed(() => {
  if (!props.organization.quota) return '--';
  if (props.organization.quota.apps.total_memory_in_mb === null) return '∞';
  return `${convertMemory(props.organization.quota.apps.total_memory_in_mb, MemoryUnit.MB).GB} GB`;
});
</script>

<template>
  <v-card :to="{ name: RouteNames.ORGANIZATION, params: { guid: organization.guid } }" density="compact">
    <v-progress-linear :color="organization.suspended ? 'warning' : 'transparent'" model-value="100">
    </v-progress-linear>

    <v-card-title>{{ organization.name }}</v-card-title>

    <v-card-text>
      <v-row class="justify-space-between" dense>
        <v-col>Instances</v-col>
        <v-col cols="auto">{{ organization.quota?.apps.total_instances ?? '--' }}</v-col>
      </v-row>

      <v-row class="justify-space-between" dense>
        <v-col>Mémoire</v-col>
        <v-col cols="auto">{{ memory }}</v-col>
      </v-row>

      <v-row class="justify-space-between" dense>
        <v-col>Création</v-col>
        <v-col cols="auto">{{ formatDate(organization.created_at, 'DD/MM/YYYY HH:mm:ss') }}</v-col>
      </v-row>

      <v-row class="justify-space-between" dense>
        <v-col>Mise à jour</v-col>
        <v-col cols="auto">{{ formatDate(organization.updated_at, 'DD/MM/YYYY HH:mm:ss') }}</v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
