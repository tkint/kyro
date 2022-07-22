<script setup lang="ts">
import { ref } from 'vue';
import { z } from 'zod';
import { useForm } from '@/composables/useForm';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const { input, rulesFor, isValid } = useForm(
  {
    username: z.string().min(1),
    password: z.string().min(1),
  },
  {
    username: '',
    password: '',
  },
);

const loading = ref(false);
const submit = async () => {
  loading.value = true;
  if (isValid.value) {
    await authStore.initToken(input);
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
            <v-card-title>Connexion</v-card-title>

            <v-card-text>
              <v-text-field label="Identifiant" v-model="input.username" required :rules="rulesFor('username')">
              </v-text-field>

              <v-text-field
                label="Mot de passe"
                type="password"
                v-model="input.password"
                required
                :rules="rulesFor('password')">
              </v-text-field>

              <v-btn type="submit" class="mx-auto" color="teal-accent-4" :disabled="!isValid" :loading="loading"
                >Se connecter</v-btn
              >
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
