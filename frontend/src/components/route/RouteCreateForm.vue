<script setup lang="ts">
import routeApi from '@/api/route';
import { useForm } from '@/composables/useForm';
import useLoadData, { useLoadPaginatedData } from '@/composables/useLoadData';
import { CFSpace } from '@/models/cf/space';
import { RouteInput } from '@/models/route';
import { sortBy } from 'lodash';
import { computed } from 'vue';
import { z } from 'zod';

type Input = Omit<RouteInput, 'spaceGuid'>;

const props = defineProps<{
  spaceGuid: CFSpace['guid'];
}>();

const { schema, input, validate, rulesFor } = useForm<Input>(
  {
    domainGuid: z.string(),
    host: z.string().optional(),
    path: z.string().optional(),
    port: z.number().optional(),
  },
  { domainGuid: '' },
);

const {
  data: domains,
  error,
  loading,
  loadData,
  resetData,
} = useLoadPaginatedData((page) => routeApi.listDomains({ page, perPage: 20 }));

const sortedDomains = computed(() => sortBy(domains.value?.resources, 'name'));

loadData();
</script>

<template>
  <v-form>
    <v-card>
      <v-card-text>
        <v-autocomplete
          v-model="input.domainGuid"
          :items="sortedDomains"
          item-title="name"
          item-value="guid"
          :loading="loading"
          clearable>
        </v-autocomplete>
      </v-card-text>
    </v-card>
  </v-form>
</template>
