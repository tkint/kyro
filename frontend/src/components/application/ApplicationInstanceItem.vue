<script setup lang="ts">
import { CFProcessStats } from '@/models/cf/process';
import { convertMemory, MemoryUnit, percentage } from '@/utils/number';

const props = defineProps<{
  process: CFProcessStats;
}>();
</script>

<template>
  <tr>
    <td cols="auto">#{{ process.index }}</td>

    <td cols="auto">{{ process.state }}</td>

    <td>
      <v-row>
        <v-col>
          <template v-if="process.usage !== undefined">
            {{ convertMemory(process.usage?.mem, MemoryUnit.B).MB.toFixed(2) }} /
            {{ convertMemory(process.mem_quota, MemoryUnit.B).MB.toFixed(2) }} MB
          </template>
          <template v-else>--</template>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-progress-linear
            rounded
            :model-value="percentage(process.usage?.mem ?? 0, process.mem_quota)"
            color="success"></v-progress-linear>
        </v-col>
      </v-row>
    </td>

    <td>
      <v-row>
        <v-col>
          <template v-if="process.usage !== undefined">
            {{ convertMemory(process.usage.disk, MemoryUnit.B).MB.toFixed(2) }} /
            {{ convertMemory(process.disk_quota, MemoryUnit.B).MB.toFixed(2) }} MB
          </template>
          <template v-else>--</template>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-progress-linear
            rounded
            :model-value="percentage(process.usage?.disk ?? 0, process.disk_quota)"
            color="success"></v-progress-linear>
        </v-col>
      </v-row>
    </td>

    <td>
      <v-row>
        <v-col>
          <template v-if="process.usage !== undefined">
            {{ convertMemory(process.usage.cpu, MemoryUnit.B).MB.toFixed(2) }} /
            {{ convertMemory(process.fds_quota, MemoryUnit.B).MB.toFixed(2) }} MB
          </template>
          <template v-else>--</template>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-progress-linear
            rounded
            :model-value="percentage(process.usage?.cpu ?? 0, process.fds_quota)"
            color="success"></v-progress-linear>
        </v-col>
      </v-row>
    </td>
  </tr>
</template>
