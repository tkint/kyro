<script setup lang="ts">
import { appInfos } from '@/api';
import LogStreamItem from '@/components/logstream/LogStreamItem.vue';
import useApplicationContext from '@/composables/useApplicationContext';
import { CFEvent, CFEventType } from '@/models/cf/event';
import { useAuthStore } from '@/stores/auth';
import { absoluteOrRelativeURL } from '@/utils/url';
import { computed, reactive, ref } from 'vue';

const MAX_EVENTS = 1000;

const authStore = useAuthStore();
const { application } = useApplicationContext();

const connected = ref(false);

const events = reactive<CFEvent[]>([]);

const deleteLogs = () => {
  events.splice(0, events.length);
};

const init = async (options: { forceRenew: boolean } = { forceRenew: false }) => {
  if (application.value) {
    const { wssUrl } = appInfos;

    const authorization = await authStore.getAuthorization({ forceRenew: options.forceRenew });

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

    logsUrl.pathname += `apps/${application.value.guid}/logs`;
    logsUrl.search = new URLSearchParams({
      authorization: authorization ?? '',
      recent: 'true',
    }).toString();

    const ws = new WebSocket(logsUrl);

    ws.addEventListener('open', () => {
      connected.value = true;
    });

    ws.addEventListener('close', () => {
      connected.value = false;
      // init({ forceRenew: true });
    });

    ws.addEventListener('message', (message) => {
      const event: CFEvent = JSON.parse(message.data);
      while (events.length > MAX_EVENTS - 1) {
        events.shift();
      }
      events.push(event);
    });
  }
};
init();

const filters = reactive<{
  types: CFEventType[];
  messageTypes: CFEvent.Log.Type[];
}>({
  types: [],
  messageTypes: Object.values(CFEvent.Log.Type),
});
const filteredEvents = computed(() =>
  events.filter((event) => {
    const { types, messageTypes } = filters;

    if (types.length === 0 && messageTypes.length === 0) return true;

    return types.includes(event.type) || (event.type === CFEventType.Log && messageTypes.includes(event.log.type));
  }),
);
</script>

<template>
  <v-card>
    <v-toolbar density="compact">
      <v-toolbar-title>
        Log Stream
        <v-btn @click="deleteLogs">
          <v-icon>mdi-delete-outline</v-icon>
          <v-tooltip activator="parent" location="bottom">Delete logs</v-tooltip>
        </v-btn>

        {{ events.length }} / {{ MAX_EVENTS }}
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-chip-group v-model="filters.messageTypes" column multiple>
        <v-chip
          v-for="messageType in Object.values(CFEvent.Log.Type)"
          :key="`message-type-${messageType}`"
          filter
          outlined
          :value="messageType">
          {{ CFEventType.Log }} {{ messageType }}
        </v-chip>
      </v-chip-group>

      <!-- <v-chip-group v-model="filters.types" column multiple>
        <v-chip
          v-for="eventType in Object.values(CFEventType).filter((type) => type !== CFEventType.Log)"
          :key="`event-type-${eventType}`"
          filter
          outlined
          :value="eventType">
          {{ eventType }}
        </v-chip>
      </v-chip-group> -->

      <v-badge :color="connected ? 'success' : 'error'" class="me-2" inline>
        <v-tooltip activator="parent" location="bottom">{{ connected ? 'Connecté' : 'Connexion en erreur' }}</v-tooltip>
      </v-badge>
    </v-toolbar>

    <v-card-text>
      <log-stream-item v-for="(event, index) in filteredEvents" :event="event" :key="`event-${index}`">
      </log-stream-item>
    </v-card-text>
  </v-card>
</template>
