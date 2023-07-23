<script setup lang="ts">
import ConfirmCard from '@/components/shared/ConfirmCard.vue';
import { computed } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  loading?: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', newValue: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const localValue = computed({
  get: () => props.modelValue,
  set: (newValue) => emits('update:modelValue', newValue),
});

const cancel = () => {
  emits('cancel');
  localValue.value = false;
};
</script>

<template>
  <v-dialog v-model="localValue" width="500">
    <confirm-card @confirm="emits('confirm')" @cancel="cancel" :loading="loading">
      <template #text><slot name="text"></slot></template>
    </confirm-card>
  </v-dialog>
</template>
