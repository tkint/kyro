<script setup lang="ts">
import { CFSSHEnabled } from '@/models/cf/ssh';

const props = defineProps<{
  sshEnabled: CFSSHEnabled;
}>();
</script>

<template>
  <v-card>
    <v-card-title>SSH</v-card-title>

    <v-card-text>
      <v-row>
        <v-col>
          <div>Enabled</div>
          <div>{{ sshEnabled.enabled ? 'Yes' : 'No' }} - {{ sshEnabled.reason }}</div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
