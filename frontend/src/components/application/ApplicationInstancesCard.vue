<script setup lang="ts">
import ApplicationInstanceItem from '@/components/application/ApplicationInstanceItem.vue';
import { CFApplication } from '@/models/cf/application';
import { CFProcessState, ProcessStatsResources } from '@/models/cf/process';
import { computed } from 'vue';

const props = defineProps<{
  application: CFApplication;
  processes: ProcessStatsResources;
}>();

const values = computed(() => {
  const { resources } = props.processes;
  const total = resources.length;
  const running = resources.filter(({ state }) => state === CFProcessState.RUNNING).length;

  return {
    total,
    running,
    percentage: (running / total) * 100,
  };
});
</script>

<template>
  <v-card>
    <v-card-title>
      <v-row>
        <v-col>Instances</v-col>
        <v-col class="text-end">
          <v-chip density="compact">{{ values.running }}/{{ values.total }}</v-chip>
        </v-col>
      </v-row>
    </v-card-title>

    <v-card-text>
      <v-table>
        <thead>
          <tr>
            <th>Index</th>
            <th>State</th>
            <th>MEM</th>
            <th>DISK</th>
            <th>CPU</th>
          </tr>
        </thead>

        <tbody>
          <application-instance-item
            v-for="(process, index) in processes.resources"
            :key="`process-${index}`"
            :process="process">
          </application-instance-item>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>
