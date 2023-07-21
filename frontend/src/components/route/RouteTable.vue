<script setup lang="ts">
import RouteTableItem from '@/components/route/RouteTableItem.vue';
import { CFRoute } from '@/models/cf/route';

defineProps<{
  routes: CFRoute[];
}>();
</script>

<template>
  <v-table>
    <thead>
      <tr>
        <th>Route</th>
        <th>Port</th>
        <th>Creation date</th>
        <th>Destinations</th>
      </tr>
    </thead>

    <tbody>
      <route-table-item v-for="route in routes" :key="`route-${route.guid}`" :route="route"></route-table-item>
    </tbody>
  </v-table>
</template>
