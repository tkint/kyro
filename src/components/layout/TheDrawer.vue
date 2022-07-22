<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  show: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:show', newValue: boolean): void;
}>();

const localSHow = computed({
  get: () => props.show,
  set: (newValue) => emits('update:show', newValue),
});
</script>

<template>
  <v-navigation-drawer app v-model="localSHow" color="grey-lighten-3"></v-navigation-drawer>
</template>
