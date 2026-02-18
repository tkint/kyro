<script setup lang="ts">
import { CFServiceInstance } from '@/models/cf/service';
import { formatDate } from '@/utils/date';
import { computed } from 'vue';

type RelatedResource = {
  guid: string;
  name: string;
};

const props = defineProps<{
  service: CFServiceInstance & { space?: RelatedResource; organization?: RelatedResource };
  deleting?: boolean;
}>();

const emits = defineEmits<{
  (e: 'delete'): void;
}>();

const progressColor = computed(() => {
  switch (props.service.last_operation.state) {
    case 'initial':
      return 'grey';
    case 'succeeded':
      return 'success';
    case 'in progress':
      return 'info';
    case 'failed':
      return 'warning';
  }
});
</script>

<template>
  <v-card density="compact">
    <v-progress-linear
      :color="progressColor"
      model-value="100"
      :indeterminate="service.last_operation.state === 'in progress'">
    </v-progress-linear>

    <v-card-title :title="service.name">{{ service.name }}</v-card-title>

    <v-card-text>
      <v-row class="justify-space-between" dense>
        <v-col>Organisation</v-col>
        <v-col cols="auto">{{ service.organization?.name ?? '--' }}</v-col>
      </v-row>

      <v-row class="justify-space-between" dense>
        <v-col>Space</v-col>
        <v-col cols="auto">{{ service.space?.name ?? '--' }}</v-col>
      </v-row>

      <v-row class="justify-space-between" dense>
        <v-col>Dernière opération</v-col>
        <v-col cols="auto">{{ service.last_operation.type }} / {{ service.last_operation.state }}</v-col>
      </v-row>

      <v-row class="justify-space-between" dense>
        <v-col>Création</v-col>
        <v-col cols="auto">{{ formatDate(service.created_at, 'DD/MM/YYYY HH:mm:ss') }}</v-col>
      </v-row>

      <v-row class="justify-space-between" dense>
        <v-col>Mise à jour</v-col>
        <v-col cols="auto">{{ formatDate(service.updated_at, 'DD/MM/YYYY HH:mm:ss') }}</v-col>
      </v-row>
    </v-card-text>

    <v-card-actions class="justify-end">
      <v-btn
        color="warning"
        variant="text"
        size="small"
        :loading="deleting"
        :disabled="deleting"
        @click.stop="emits('delete')">
        <v-icon>mdi-delete-outline</v-icon>
        <v-tooltip activator="parent" location="bottom">Delete service instance</v-tooltip>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
