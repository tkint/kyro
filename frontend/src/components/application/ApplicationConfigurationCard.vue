<script setup lang="ts">
import { CFApplication } from '@/models/cf/application';

const props = defineProps<{
  application: CFApplication;
}>();
</script>

<template>
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
</template>
