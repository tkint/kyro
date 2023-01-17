<script setup lang="ts">
import ApplicationCard from '@/components/application/ApplicationCard.vue';
import ApplicationConfigurationCard from '@/components/application/ApplicationConfigurationCard.vue';
import ApplicationInstancesCard from '@/components/application/ApplicationInstancesCard.vue';
import useApplicationContext from '@/composables/useApplicationContext';

const { application, processes } = useApplicationContext();
</script>

<template>
  <v-row class="" v-if="application">
    <v-col>
      <application-card :application="application"></application-card>
    </v-col>

    <v-col>
      <application-configuration-card :application="application"></application-configuration-card>
    </v-col>
  </v-row>

  <v-row v-if="application && processes">
    <v-col>
      <application-instances-card :application="application" :processes="processes"></application-instances-card>
    </v-col>
  </v-row>
</template>
