<script setup lang="ts">
defineProps<{
  loading?: boolean;
}>();

const emits = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <v-card :loading="loading">
    <template #loader="{ isActive }">
      <v-progress-linear :active="isActive" color="primary" indeterminate></v-progress-linear>
    </template>

    <v-card-text><slot name="text">Confirmer</slot></v-card-text>

    <v-card-actions class="justify-center">
      <v-btn color="primary" @click="emits('confirm')">Oui</v-btn>
      <v-btn @click="emits('cancel')">Non</v-btn>
    </v-card-actions>
  </v-card>
</template>
