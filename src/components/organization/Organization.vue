<script setup lang="ts">
import { CFOrganization } from '@/models/cf/organization';

const props = defineProps<{
  organization: CFOrganization;
}>();
</script>

<template>
  <v-row>
    <v-col>
      <v-toolbar>
        <v-toolbar-title class="v-col-auto">
          {{ organization.name }}
        </v-toolbar-title>
      </v-toolbar>
    </v-col>
  </v-row>

  <v-row>
    <v-col>
      {{ organization }}
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
