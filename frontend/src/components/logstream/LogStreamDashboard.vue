<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { reactive, ref, watch } from 'vue';
import { getAppInfos } from '@/api';
import LogStreamItem from '@/components/logstream/LogStreamItem.vue';
import useFilterData from '@/composables/useFilterData';
import { CFApplication } from '@/models/cf/application';
import { CFEvent, CFEventType } from '@/models/cf/event';
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

const filters = reactive<{
  types: CFEventType[];
  messageTypes: CFEvent.LogMessage.MessageType[];
}>({
  types: [],
  messageTypes: [],
});
const filteredEvents = computed(() =>
  events.filter((event) => {
    const { types, messageTypes } = filters;

    if (types.length === 0 && messageTypes.length === 0) return true;

    return (
      types.includes(event.eventType) ||
      (event.eventType === CFEventType.LogMessage && messageTypes.includes(event.logMessage.messageType))
    );
  }),
);
</script>

<template>
  <v-card>
    <v-toolbar density="compact">
      <v-toolbar-title>Log Stream</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-chip-group v-model="filters.messageTypes" column multiple>
        <v-chip
          v-for="messageType in Object.values(CFEvent.LogMessage.MessageType)"
          :key="`message-type-${messageType}`"
          filter
          outlined
          :value="messageType">
          {{ CFEventType.LogMessage }} {{ messageType }}
        </v-chip>
      </v-chip-group>

      <v-chip-group v-model="filters.types" column multiple>
        <v-chip
          v-for="eventType in Object.values(CFEventType).filter((type) => type !== CFEventType.LogMessage)"
          :key="`event-type-${eventType}`"
          filter
          outlined
          :value="eventType">
          {{ eventType }}
        </v-chip>
      </v-chip-group>

      <v-chip variant="elevated" :color="connected ? 'success' : 'error'" class="me-5">
        {{ connected ? 'OK' : 'KO' }}
      </v-chip>
    </v-toolbar>

    <v-card-text>
      <log-stream-item v-for="(event, index) in filteredEvents" :event="event" :key="`event-${index}`">
      </log-stream-item>
    </v-card-text>
  </v-card>
</template>
