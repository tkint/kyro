<script setup lang="ts">
import ApplicationCard from '@/components/application/ApplicationCard.vue';
import { CFApplication } from '@/models/cf/application';

const props = defineProps<{
  application: CFApplication;
}>();
</script>

<template>
  <v-row>
    <v-col>
      <v-toolbar>
        <v-toolbar-title class="v-col-auto">
          {{ application.name }}
        </v-toolbar-title>

        <v-btn :disabled="application.state === 'STARTED'">Start</v-btn>
        <v-btn :disabled="application.state === 'STOPPED'">Stop</v-btn>
        <v-btn :disabled="application.state === 'STARTED'">Restart</v-btn>
        <v-btn>Restage</v-btn>
      </v-toolbar>
    </v-col>
  </v-row>

  <v-row>
    <v-col>
      <application-card :application="application"></application-card>
    </v-col>

    <v-col>
      <v-card>
        <v-card-title>Configuration</v-card-title>

        <v-card-text>
          <v-row>
            <v-col>Stack</v-col>
            <v-col>{{ application.lifecycle.data.stack }}</v-col>
          </v-row>

          <v-row>
            <v-col>Buildpacks</v-col>
            <v-col>
              {{ application.lifecycle.data.buildpacks.join(', ') }}
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
