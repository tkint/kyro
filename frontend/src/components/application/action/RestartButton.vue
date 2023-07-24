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

const { fn: launchRestart } = useLoadingFn(async () => {
  const result = await applicationApi.restart(props.application.guid);

  if (result.success) {
  }
}, loading);
</script>

<template>
  <v-btn @click="launchRestart" :loading="loading" :disabled="disabled">
    <v-icon>mdi-reload</v-icon>
    <v-tooltip activator="parent" location="bottom">Restart</v-tooltip>
  </v-btn>
</template>
