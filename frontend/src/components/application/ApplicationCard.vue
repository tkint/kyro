<script setup lang="ts">
import dayjs from 'dayjs';
import { CFApplication } from '@/models/cf/application';
import { RouteNames } from '@/router';

const props = defineProps<{
  application: CFApplication;
}>();
</script>

<template>
  <v-card>
    <v-card-title>Application</v-card-title>

    <v-card-text>
      <v-row>
        <v-col>Etat</v-col>
        <v-col>{{ application.state }}</v-col>
      </v-row>

      <v-row>
        <v-col>Créée</v-col>
        <v-col>
          {{ dayjs(application.created_at).format('DD/MM/YYYY HH:mm:ss') }}
        </v-col>
      </v-row>
      <v-row>
        <v-col>Mise à jour</v-col>
        <v-col>
          {{ dayjs(application.updated_at).format('DD/MM/YYYY HH:mm:ss') }}
        </v-col>
      </v-row>

      <template v-if="application.included">
        <v-row>
          <v-col>Organisation</v-col>
          <v-col v-if="application.included.organizations.length > 0">
            <router-link
              :to="{ name: RouteNames.ORGANIZATION, params: { guid: application.included.organizations[0].guid } }">
              {{ application.included.organizations[0].name }}
            </router-link>
          </v-col>
        </v-row>

        <v-row>
          <v-col>Space</v-col>
          <v-col v-if="application.included.spaces.length > 0">
            <router-link :to="{ name: RouteNames.SPACE, params: { guid: application.included.spaces[0].guid } }">
              {{ application.included.spaces[0].name }}
            </router-link>
          </v-col>
        </v-row>
      </template>
    </v-card-text>
  </v-card>
</template>
