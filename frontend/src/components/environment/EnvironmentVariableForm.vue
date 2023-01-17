<script setup lang="ts">
import { getCurrentInstance, onMounted, watch, nextTick, ref } from 'vue';
import { z } from 'zod';
import { useForm } from '@/composables/useForm';
import { EnvironmentVariableInput } from '@/models/environment';

const props = defineProps<{
  initialInput?: EnvironmentVariableInput;
}>();

const emits = defineEmits<{
  (e: 'submit', newValue: EnvironmentVariableInput): void;
}>();

const { input, validate, rulesFor } = useForm<EnvironmentVariableInput>(
  {
    key: z.string(),
    value: z.string(),
  },
  props.initialInput ?? { key: '', value: '' },
);

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
          label="Clef"
          density="compact"
          v-model="input.key"
          required
          :autofocus="!initialInput"
          :disabled="!!initialInput"
          :rules="rulesFor('key')"></v-text-field>
        <v-text-field
          label="Valeur"
          density="compact"
          v-model="input.value"
          required
          :autofocus="!!initialInput"
          :rules="rulesFor('value')"></v-text-field>
      </v-card-text>

      <v-card-actions>
        <v-btn type="submit" color="primary" block>Enregistrer</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>
