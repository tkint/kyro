<script setup lang="ts">
import { CFRoute } from '@/models/cf/route';
import { formatDate } from '@/utils/date';

defineProps<{
  route: CFRoute;
}>();

const emits = defineEmits<{
  (e: 'open'): void;
  (e: 'unmap'): void;
}>();
</script>

<template>
  <tr>
    <td>
      <a target="_blank" :href="`${route.protocol}://${route.url}`"> {{ route.protocol }}://{{ route.url }} </a>
    </td>

    <td>{{ route.port || '--' }}</td>

    <td>{{ formatDate(route.created_at, 'DD/MM/YYYY HH:mm:ss') }}</td>

    <td>
      <div v-for="destination in route.destinations" :key="`destination-${destination.guid}`">
        {{ destination.protocol }} - {{ destination.port }}
      </div>
    </td>

    <td>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-dots-horizontal" v-bind="props" flat></v-btn>
        </template>

        <v-list>
          <v-list-item @click="emits('open')">Details</v-list-item>
          <v-list-item @click="emits('unmap')">Unmap</v-list-item>
        </v-list>
      </v-menu>
    </td>
  </tr>
</template>
