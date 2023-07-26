<script setup lang="ts">
import CopyableText from '@/components/shared/CopyableText.vue';
import { ApplicationState } from '@/composables/useApplicationState';
import { RouteNames } from '@/core/router';
import { CFApplication } from '@/models/cf/application';
import dayjs from 'dayjs';

const props = defineProps<{
  application: CFApplication;
  state: ApplicationState;
}>();
</script>

<template>
  <v-card>
    <v-card-title>Application</v-card-title>

    <v-card-text>
      <v-row>
        <v-col>
          <div>Etat</div>
          <div>{{ state.state }}</div>
        </v-col>

        <v-col>
          <div>Guid <copyable-text :text="application.guid"></copyable-text></div>
          <div>{{ application.guid }}</div>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <div>Création</div>
          <div>{{ dayjs(application.created_at).format('DD/MM/YYYY HH:mm:ss') }}</div>
        </v-col>

        <v-col>
          <div>Mise à jour</div>
          <div>{{ dayjs(application.updated_at).format('DD/MM/YYYY HH:mm:ss') }}</div>
        </v-col>
      </v-row>

      <template v-if="application.included">
        <v-row>
          <v-col>
            <div>Organisation</div>
            <div v-if="application.included.organizations[0]">
              <router-link
                :to="{ name: RouteNames.ORGANIZATION, params: { guid: application.included.organizations[0].guid } }">
                {{ application.included.organizations[0].name }}
              </router-link>
            </div>
          </v-col>

          <v-col>
            <div>Space</div>
            <div v-if="application.included.spaces[0]">
              <router-link :to="{ name: RouteNames.SPACE, params: { guid: application.included.spaces[0].guid } }">
                {{ application.included.spaces[0].name }}
              </router-link>
            </div>
          </v-col>
        </v-row>
      </template>
    </v-card-text>
  </v-card>
</template>
