<script setup lang="ts">
import { computed } from 'vue';
import { CFEvent, CFEventType } from '@/models/cf/event';
import { fromEpoch } from '@/utils/date';

const props = defineProps<{
  event: CFEvent;
}>();

const formattedData = computed(() => {
  const { timestamp, eventType } = props.event;

  const data = [`[${timestamp ? fromEpoch(timestamp).format('DD/MM/YYYY HH:mm:ss') : '--/--/---- --:--:--'}]`];

  switch (eventType) {
    case CFEventType.ContainerMetric:
      const { instanceIndex, cpuPercentage, diskBytes, diskBytesQuota, memoryBytes, memoryBytesQuota } =
        props.event.containerMetric;

      data.push(
        `#${instanceIndex} |`,
        `CPU ${cpuPercentage.toFixed(2)}% |`,
        `MEM ${(memoryBytes / 1000000).toFixed(2)} MB - ${
          memoryBytesQuota && `${((memoryBytes / memoryBytesQuota) * 100).toFixed(2)}%`
        } |`,
        `DISK ${(diskBytes / 1000000).toFixed(2)} MB - ${
          diskBytesQuota && `${((diskBytes / diskBytesQuota) * 100).toFixed(2)}%`
        } |`,
      );
      break;
    case CFEventType.LogMessage:
      const { message, messageType } = props.event.logMessage;

      const textClass = ['font-weight-bold', messageType === CFEvent.LogMessage.MessageType.ERR && 'text-error'].join(
        ' ',
      );

      data.push(`<span class="${textClass}">${messageType} ${atob(message)}</span>`);
      break;
  }

  return data.join(' ');
});
</script>

<template>
  <!-- <div class="mb-4">{{ event }}</div> -->
  <div v-html="formattedData" class="font-weight-bold text-grey-darken-3"></div>
</template>
