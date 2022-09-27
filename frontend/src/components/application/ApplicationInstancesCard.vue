<script setup lang="ts">
import { computed } from 'vue';
import { CFApplication } from '@/models/cf/application';
import { CFProcessState, PaginatedProcessStats } from '@/models/cf/process';

const props = defineProps<{
  application: CFApplication;
  processes: PaginatedProcessStats;
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
      <v-row v-for="(process, index) in processes.resources" :key="`process-${index}`">
        <v-col cols="auto">#{{ process.index }}</v-col>

        <v-col cols="auto">{{ process.state }}</v-col>

        <v-col>
          <v-row dense>
            <v-col>
              MEM: {{ process.mem_quota ? Math.round((process.usage.mem / process.mem_quota) * 100) : 0 }} %
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-progress-linear
                rounded
                :model-value="process.mem_quota ? Math.round((process.usage.mem / process.mem_quota) * 100) : 0"
                color="success">
              </v-progress-linear>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
