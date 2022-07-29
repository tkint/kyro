<script setup lang="ts">
import { RouteNames } from '@/router';

const props = defineProps<{
  pathMatch: string[];
}>();
</script>

<template>
  <v-container class="h-50">
    <v-row class="h-100" justify="center" align-content="center">
      <v-col cols="4">
        <v-card>
          <v-card-title>Page inexistante</v-card-title>

          <v-card-text>
            La page <b>{{ pathMatch.join('/') }}</b> n'existe pas
          </v-card-text>

          <v-card-actions>
            <v-btn :to="{ name: RouteNames.HOME }">Revenir à l'accueil</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
