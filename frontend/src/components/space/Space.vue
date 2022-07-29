<script setup lang="ts">
import { CFSpace } from '@/models/cf/space';

const props = defineProps<{
  space: CFSpace;
}>();
</script>

<template>
  <v-row>
    <v-col>
      <v-toolbar>
        <v-toolbar-title class="v-col-auto">
          {{ space.name }}
        </v-toolbar-title>
      </v-toolbar>
    </v-col>
  </v-row>

  <v-row>
    <v-col>
      {{ space }}
    </v-col>

    <v-col>
      <v-card>
        <v-card-title>Configuration</v-card-title>

        <v-card-text>
          <v-row>
            <v-col></v-col>
            <v-col></v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
