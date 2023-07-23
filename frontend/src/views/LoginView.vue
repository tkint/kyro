<script setup lang="ts">
import { ApiErrorResponse } from '@/api';
import LocalePicker from '@/components/shared/LocalePicker.vue';
import { useForm } from '@/composables/useForm';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

const { t } = useI18n();
const authStore = useAuthStore();

const { input, rulesFor, validate, isValid } = useForm({
  username: z.string().min(1),
  password: z.string().min(1),
});

const error = ref<ApiErrorResponse>();
const loading = ref(false);
const submit = async () => {
  error.value = undefined;
  loading.value = true;

  const validationResult = validate();

  if (validationResult.success) {
    const result = await authStore.initToken(validationResult.data);
    if (!result.success) {
      error.value = result.error;
    }
  }
  loading.value = false;
};
</script>

<template>
  <v-form class="h-100" @submit.prevent="submit">
    <v-container class="h-100">
      <v-row class="h-100" justify="center" align-content="center">
        <v-col cols="4">
          <v-card>
            <v-card-title>
              <v-row>
                <v-col>{{ t('auth.authentication') }}</v-col>

                <v-col cols="auto">
                  <locale-picker></locale-picker>
                </v-col>
              </v-row>
            </v-card-title>

            {{ error }}

            <v-card-text class="pb-0">
              <v-text-field :label="t('auth.username')" v-model="input.username" required :rules="rulesFor('username')">
              </v-text-field>

              <v-text-field
                :label="t('auth.password')"
                type="password"
                v-model="input.password"
                required
                :rules="rulesFor('password')">
              </v-text-field>
            </v-card-text>

            <v-card-actions class="pt-0">
              <v-btn block type="submit" color="teal-accent-4" :disabled="!isValid" :loading="loading">
                {{ t('auth.login') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
