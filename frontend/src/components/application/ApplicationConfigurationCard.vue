<script setup lang="ts">
import { CFApplication } from '@/models/cf/application';
import { CFLifecycle } from '@/models/cf/lifecycle';

const props = defineProps<{
  application: CFApplication;
}>();
</script>

<template>
  <v-card>
    <v-card-title>Configuration</v-card-title>

    <v-card-text>
      <v-row>
        <v-col>
          <div>Lifecyle</div>
          <div>{{ application.lifecycle.type }}</div>
        </v-col>
      </v-row>

      <v-row v-if="application.lifecycle.type === CFLifecycle.Type.BUILDPACK">
        <v-col>
          <div>Stack</div>
          <div>{{ application.lifecycle.data.stack }}</div>
        </v-col>

        <v-col>
          <div>Buildpacks</div>
          <div>{{ application.lifecycle.data.buildpacks.join(', ') }}</div>
        </v-col>
      </v-row>

      <v-row v-else-if="application.lifecycle.type === CFLifecycle.Type.KPACK">
        <v-col>
          <div>Buildpacks</div>
          <div>{{ application.lifecycle.data.buildpacks.join(', ') }}</div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
