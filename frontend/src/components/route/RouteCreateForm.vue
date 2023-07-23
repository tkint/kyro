<script setup lang="ts">
import { useForm } from '@/composables/useForm';
import { CFDomain } from '@/models/cf/domain';
import { RouteInput } from '@/models/route';
import { arrayOfNotUndefined } from '@/utils/array';
import { sortBy } from 'lodash';
import { computed, ref, unref, watch } from 'vue';
import { z } from 'zod';

type Input = Omit<RouteInput, 'spaceGuid'>;

const props = defineProps<{
  domains: CFDomain[];
  loading?: boolean;
}>();

const emits = defineEmits<{
  (e: 'submit', newValue: Input): void;
}>();

const { schema, input, validate, rulesFor } = useForm<Input>({
  domainGuid: z.string(),
  host: z.string().optional(),
  path: z.string().optional(),
  port: z.number().optional(),
});

const sortedDomains = computed(() => sortBy(props.domains, 'name'));

const selectedDomain = ref<CFDomain>();
const selectedProtocol = ref<CFDomain.Protocol>();

watch(selectedDomain, (newValue) => {
  input.domainGuid = newValue?.guid;
  selectedProtocol.value = newValue?.supported_protocols[0];
});

const routeResult = computed(() => {
  const domain = unref(selectedDomain);

  let result: string;

  if (domain) {
    try {
      const protocol = unref(selectedProtocol) ?? domain.supported_protocols[0] ?? CFDomain.Protocol.HTTP;

      result = arrayOfNotUndefined(
        `${protocol}://`,
        input.host ? `${input.host}.` : '',
        domain.name,
        input.path ? encodeURI(`/${input.path}`.replaceAll(/\/+/g, '/')) : '',
      ).join('');
    } catch {
      result = '';
    }
  } else {
    result = '';
  }

  return result;
});

const submit = () => {
  const result = validate();

  if (result.success) {
    emits('submit', result.data);
  }
};
</script>

<template>
  <v-form @submit.prevent="submit">
    <v-card>
      <v-card-text>
        <v-text-field
          label="Host"
          density="compact"
          v-model="input.host"
          required
          clearable
          autofocus
          :rules="rulesFor('host')"
          @click:clear="input.host = undefined">
        </v-text-field>

        <v-select
          label="Domaine"
          density="compact"
          v-model="selectedDomain"
          :items="sortedDomains"
          item-title="name"
          return-object
          clearable>
        </v-select>

        <v-select
          v-if="selectedDomain && selectedDomain.supported_protocols.length > 1"
          label="Protocol"
          density="compact"
          v-model="selectedProtocol"
          :items="selectedDomain?.supported_protocols"
          clearable
          @click:clear="selectedDomain = undefined">
        </v-select>

        <v-text-field
          label="Path"
          density="compact"
          v-model="input.path"
          required
          clearable
          :rules="rulesFor('path')"
          @click:clear="input.path = undefined">
        </v-text-field>

        <div>Résultat</div>
        <div>{{ routeResult }}</div>
      </v-card-text>

      <v-card-actions>
        <v-btn :loading="loading" type="submit" color="primary" block>Enregistrer</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>
