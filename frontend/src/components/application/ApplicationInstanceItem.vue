<script setup lang="ts">
import { CFProcessStats } from '@/models/cf/process';
import { convertMemory, MemoryUnit, percentage } from '@/utils/number';
import { mapValues } from 'lodash';
import { computed } from 'vue';

type StatKey = 'memory' | 'disk' | 'cpu';

type Stat = {
  value: number;
  quota: number;
};

type StatUI = {
  value: string;
  quota: string;
  percentage: number;
  color: 'success' | 'warning' | 'error';
};

const props = defineProps<{
  process: CFProcessStats;
}>();

const stats = computed<Partial<Record<StatKey, StatUI>>>(() => {
  if (!props.process.usage) {
    return {};
  }

  const result: Record<StatKey, Stat> = {
    memory: {
      value: props.process.usage.mem,
      quota: props.process.mem_quota,
    },
    disk: {
      value: props.process.usage.disk,
      quota: props.process.disk_quota,
    },
    cpu: {
      value: props.process.usage.cpu,
      quota: props.process.fds_quota,
    },
  };

  return mapValues(result, (stat) => {
    const percentageValue = percentage(stat.value, stat.quota);

    const statUI: StatUI = {
      value: convertMemory(stat.value, MemoryUnit.B).MB.toFixed(2),
      quota: convertMemory(stat.quota, MemoryUnit.B).MB.toFixed(2),
      percentage: percentageValue,
      color: percentageValue > 90 ? 'error' : percentageValue > 80 ? 'warning' : 'success',
    };

    return statUI;
  });
});
</script>

<template>
  <tr>
    <td cols="auto">#{{ process.index }}</td>

    <td cols="auto">{{ process.state }}</td>

    <td>
      <div>
        <template v-if="stats.memory">{{ stats.memory.value }} / {{ stats.memory.quota }} MB</template>
        <template v-else>--</template>
      </div>

      <v-progress-linear rounded :model-value="stats.memory?.percentage ?? 0" :color="stats.memory?.color ?? 'danger'">
      </v-progress-linear>
    </td>

    <td>
      <div>
        <template v-if="stats.disk">{{ stats.disk.value }} / {{ stats.disk.quota }} MB</template>
        <template v-else>--</template>
      </div>

      <v-progress-linear rounded :model-value="stats.disk?.percentage ?? 0" :color="stats.disk?.color ?? 'danger'">
      </v-progress-linear>
    </td>

    <td>
      <div>
        <template v-if="stats.cpu">{{ stats.cpu.value }} / {{ stats.cpu.quota }} MB</template>
        <template v-else>--</template>
      </div>

      <v-progress-linear rounded :model-value="stats.cpu?.percentage ?? 0" :color="stats.cpu?.color ?? 'danger'">
      </v-progress-linear>
    </td>
  </tr>
</template>
