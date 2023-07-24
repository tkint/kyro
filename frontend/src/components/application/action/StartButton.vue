<script setup lang="ts">
import applicationApi from '@/api/application';
import useLoadingFn from '@/composables/useLoadingFn';
import { CFApplication } from '@/models/cf/application';
import { ref } from 'vue';

const props = defineProps<{
  application: CFApplication;
  disabled?: boolean;
}>();

const loading = ref(false);

const { fn: launchStart } = useLoadingFn(async () => {
  const result = await applicationApi.start(props.application.guid);

  if (result.success) {
  }
}, loading);
</script>

<template>
  <v-btn @click="launchStart" :loading="loading" :disabled="disabled">
    <v-icon>mdi-play-outline</v-icon>
    <v-tooltip activator="parent" location="bottom">Start</v-tooltip>
  </v-btn>
</template>
