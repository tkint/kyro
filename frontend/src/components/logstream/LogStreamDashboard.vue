<script setup lang="ts">
import { reactive, ref } from 'vue';
import { getAppInfos } from '@/api';
import LogStreamItem from '@/components/logstream/LogStreamItem.vue';
import { CFApplication } from '@/models/cf/application';
import { CFEvent } from '@/models/cf/event';
import { useAuthStore } from '@/stores/auth';
import { absoluteOrRelativeURL } from '@/utils/url';

const props = defineProps<{
  application: CFApplication;
}>();

const authStore = useAuthStore();

const connected = ref(false);

const events = reactive<CFEvent[]>([]);

const init = async () => {
  const { wssUrl } = await getAppInfos();

  const authorization = await authStore.getAuthorization();

  const logsUrl = absoluteOrRelativeURL(wssUrl);

  switch (window.location.protocol) {
    case 'http:':
      logsUrl.protocol = 'ws:';
      break;
    case 'https:':
      logsUrl.protocol = 'wss:';
      break;
    default:
      alert(`Bad protocol : ${window.location.protocol}`);
      return;
  }

  logsUrl.pathname += `apps/${props.application.guid}/logs`;
  logsUrl.search = new URLSearchParams({
    authorization: authorization ?? '',
  }).toString();

  const ws = new WebSocket(logsUrl);

  ws.addEventListener('open', () => {
    connected.value = true;
  });

  ws.addEventListener('close', () => {
    connected.value = false;
  });

  ws.addEventListener('message', (event) => {
    const cfEvent: CFEvent = JSON.parse(event.data);

    events.push(cfEvent);
  });
};
init();
</script>

<template>
  <v-card>
    <v-toolbar>
      <v-toolbar-title>Log Stream</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-chip variant="elevated" :color="connected ? 'success' : 'error'" class="me-5">
        {{ connected ? 'OK' : 'KO' }}
      </v-chip>
    </v-toolbar>

    <v-card-text>
      <log-stream-item v-for="(event, index) in events" :event="event"></log-stream-item>
    </v-card-text>
  </v-card>
</template>
