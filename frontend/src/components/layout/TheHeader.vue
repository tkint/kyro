<script setup lang="ts">
import LocalePicker from '@/components/shared/LocalePicker.vue';

const emits = defineEmits<{
  (e: 'toggleDrawer'): void;
}>();
</script>

<template>
  <v-app-bar color="primary" density="compact" app>
    <template #prepend>
      <v-app-bar-nav-icon @click="emits('toggleDrawer')"></v-app-bar-nav-icon>
    </template>

    <v-app-bar-title class="v-col-auto">Kyro</v-app-bar-title>

    <v-spacer></v-spacer>

    <locale-picker></locale-picker>
  </v-app-bar>
</template>
