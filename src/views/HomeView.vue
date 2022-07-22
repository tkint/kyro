<script setup lang="ts">
import { RouteNames } from '@/router';
</script>

<template>
  <v-container fluid>
    <router-link :to="{ name: RouteNames.APPLICATIONS }">Applications</router-link>
  </v-container>
</template>
