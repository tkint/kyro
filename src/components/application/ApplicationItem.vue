<script setup lang="ts">
import { PaginatedApplications } from '@/models/cf/application';
import { CFResource } from '@/models/cf/common';
import { RouteNames } from '@/router';
import { formatDate } from '@/utils/date';

type RelatedResource = {
  guid: CFResource['guid'];
  name: string;
};

defineProps<{
  application: PaginatedApplications['resources'][0] & { space?: RelatedResource; organization?: RelatedResource };
}>();
</script>

<template>
  <v-card :to="{ name: RouteNames.APPLICATION, params: { guid: application.guid } }" density="compact">
    <v-progress-linear :color="application.state === 'STARTED' ? 'success' : 'warning'" model-value="100">
    </v-progress-linear>

    <v-card-title>{{ application.name }}</v-card-title>

    <v-card-text>
      <v-row class="justify-space-between" dense>
        <v-col>Etat</v-col>
        <v-col cols="auto">{{ application.state }}</v-col>
      </v-row>

      <v-row class="justify-space-between" dense>
        <v-col cols="auto">Org/Space</v-col>
        <v-col class="text-end">
          <router-link
            v-if="application.organization"
            :to="{ name: RouteNames.ORGANIZATION, params: { guid: application.organization.guid } }">
            {{ application.organization.name }}
          </router-link>
          /
          <router-link
            @click.stop
            v-if="application.space"
            :to="{ name: RouteNames.SPACE, params: { guid: application.space.guid } }">
            {{ application.space.name }}
          </router-link>
        </v-col>
      </v-row>

      <v-row class="justify-space-between" dense>
        <v-col>Création</v-col>
        <v-col cols="auto">{{ formatDate(application.created_at, 'DD/MM/YYYY HH:mm:ss') }}</v-col>
      </v-row>

      <v-row class="justify-space-between" dense>
        <v-col>Mise à jour</v-col>
        <v-col cols="auto">{{ formatDate(application.updated_at, 'DD/MM/YYYY HH:mm:ss') }}</v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
