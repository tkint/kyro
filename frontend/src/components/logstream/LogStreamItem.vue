<script setup lang="ts">
import { CFEvent, CFEventType } from '@/models/cf/event';
import { fromEpoch } from '@/utils/date';
import { computed } from 'vue';

const props = defineProps<{
  event: CFEvent;
}>();

const formattedData = computed(() => {
  const { timestamp, type: eventType } = props.event;

  const data = [
    `[${timestamp ? fromEpoch(parseInt(timestamp)).format('DD/MM/YYYY HH:mm:ss') : '--/--/---- --:--:--'}]`,
  ];

  switch (eventType) {
    case CFEventType.Log: {
      const { payload, type } = props.event.log;

      const textClass = ['font-weight-bold', type === CFEvent.Log.Type.ERR && 'text-error'].join(' ');

      data.push(`<span class="${textClass}">${type} ${atob(payload)}</span>`);
      break;
    }

    case CFEventType.Gauge: {
      const { metrics } = props.event.gauge;

      data.push(
        ...Object.entries(metrics).map(([key, value]) => {
          return `${key}=${value.value} ${value.unit}`;
        }),
      );

      break;
    }

    case CFEventType.Timer: {
      const { name, start, stop } = props.event.timer;

      const startTime = fromEpoch(parseInt(start));
      const stopTime = fromEpoch(parseInt(stop));

      data.push(
        `${name} |`,
        `START ${startTime.format('DD/MM/YYYY HH:mm:ss')} |`,
        `STOP ${stopTime.format('DD/MM/YYYY HH:mm:ss')} |`,
        `DURATION ${stopTime.diff(startTime, 'milliseconds')}ms |`,
      );
      break;
    }
  }

  return data.join(' ');
});
</script>

<template>
  <!-- <div class="mb-4">{{ event }}</div> -->
  <div v-html="formattedData" class="font-weight-bold text-grey-darken-3"></div>
</template>
