<script setup lang="ts">
import { CFRoute } from '@/models/cf/route';
import { formatDate } from '@/utils/date';

defineProps<{
  route: CFRoute;
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
  </tr>
</template>
