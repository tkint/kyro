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
        <v-card-title>Metadata</v-card-title>

        <v-card-text>
          <v-row><v-col class="font-weight-bold">Annotations</v-col></v-row>

          <v-row v-for="(annotationValue, annotationKey) of organization.metadata.annotations">
            <v-col>{{ annotationKey }}</v-col>
            <v-col>{{ annotationValue }}</v-col>
          </v-row>

          <v-row><v-col class="font-weight-bold">Labels</v-col></v-row>

          <v-row v-for="(labelValue, labelKey) of organization.metadata.labels">
            <v-col>{{ labelKey }}</v-col>
            <v-col>{{ labelValue }}</v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
