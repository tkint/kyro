<script setup lang="ts">
import ConfirmCard from '@/components/shared/ConfirmCard.vue';

defineProps<{
  loading?: boolean;
}>();

const emits = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const modelValue = defineModel<boolean>();

const cancel = () => {
  emits('cancel');
  modelValue.value = false;
};
</script>

<template>
  <v-dialog v-model="modelValue" width="500">
    <confirm-card @confirm="emits('confirm')" @cancel="cancel" :loading="loading">
      <template #text><slot name="text"></slot></template>
    </confirm-card>
  </v-dialog>
</template>
