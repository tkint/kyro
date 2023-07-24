<script setup lang="ts">
import useLoadingFn from '@/composables/useLoadingFn';
import { CFApplication } from '@/models/cf/application';
import { ref } from 'vue';

const props = defineProps<{
  application: CFApplication;
  disabled?: boolean;
}>();

const loading = ref(false);

const { fn: launchDelete } = useLoadingFn(async () => {}, loading);
</script>

<template>
  <v-btn @click="launchDelete" :loading="loading" :disabled="disabled">
    <v-icon>mdi-delete-outline</v-icon>
    <v-tooltip activator="parent" location="bottom">Delete</v-tooltip>
  </v-btn>
</template>
