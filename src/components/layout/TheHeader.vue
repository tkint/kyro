<script setup lang="ts">
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
  </v-app-bar>
</template>
