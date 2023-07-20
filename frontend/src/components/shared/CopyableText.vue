<script setup lang="ts">
import useClipboard from '@/composables/useClipboard';
import { ref } from 'vue';

const props = defineProps<{
  text: string;
}>();

const { copy } = useClipboard();

const copied = ref(false);

const copyText = () => {
  copied.value = false;
  copy(props.text);
  copied.value = true;

  setTimeout(() => {
    copied.value = false;
  }, 3000);
};
</script>

<template>
  <v-btn
    density="compact"
    variant="text"
    size="small"
    @click="copyText"
    :color="copied ? 'success' : undefined"
    :icon="copied ? 'mdi-checkbox-marked-circle' : 'mdi-clipboard-outline'">
  </v-btn>
</template>
