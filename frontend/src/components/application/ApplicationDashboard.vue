<script setup lang="ts">
import ApplicationCard from '@/components/application/ApplicationCard.vue';
import ApplicationConfigurationCard from '@/components/application/ApplicationConfigurationCard.vue';
import ApplicationInstancesCard from '@/components/application/ApplicationInstancesCard.vue';
import { CFApplication } from '@/models/cf/application';
import { CFEnvironmentVariables } from '@/models/cf/environment';
import { PaginatedProcessStats } from '@/models/cf/process';

const props = defineProps<{
  application: CFApplication;
  environment: CFEnvironmentVariables;
  processes: PaginatedProcessStats;
}>();
</script>

<template>
  <v-row class="">
    <v-col>
      <application-card :application="application"></application-card>
    </v-col>

    <v-col>
      <application-configuration-card :application="application"></application-configuration-card>
    </v-col>
  </v-row>

  <v-row v-if="processes">
    <v-col>
      <application-instances-card :application="application" :processes="processes"></application-instances-card>
    </v-col>
  </v-row>
</template>
