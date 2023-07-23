<script setup lang="ts">
import { ApiErrorResponse } from '@/api';
import routeApi from '@/api/route';
import ApiErrorAlert from '@/components/ApiErrorAlert.vue';
import RouteCreateForm from '@/components/route/RouteCreateForm.vue';
import ConfirmCard from '@/components/shared/ConfirmCard.vue';
import { loadPaginatedData } from '@/composables/useApiCall';
import useLoadingFn from '@/composables/useLoadingFn';
import { CFApplication } from '@/models/cf/application';
import { CFDomain } from '@/models/cf/domain';
import { CFRoute } from '@/models/cf/route';
import { RouteInput } from '@/models/route';
import { ref } from 'vue';

type State =
  | {
      mode: 'form';
    }
  | {
      mode: 'confirm';
      route: CFRoute;
      cancel: () => void;
      confirm: () => void;
    }
  | {
      mode: 'error';
      error: ApiErrorResponse;
      conflicts?: CFRoute[];
    };

const props = defineProps<{
  application: CFApplication;
  domains: CFDomain[];
  loading?: boolean;
}>();

const emits = defineEmits<{
  (e: 'success', data: { route: CFRoute }): void;
  (e: 'cancel'): void;
}>();

const state = ref<State>({ mode: 'form' });

const confirming = ref(false);
const { fn: handleSubmit, loading } = useLoadingFn(async (input: Omit<RouteInput, 'spaceGuid'>) => {
  const finalInput: RouteInput = {
    spaceGuid: props.application.relationships.space.data.guid,
    ...input,
  };

  let route: CFRoute;

  const linkRouteToApplication = async () => {
    const result = await routeApi.insertDestinations(route.guid, [
      {
        app: {
          guid: props.application.guid,
        },
      },
    ]);

    if (result.success) {
      const routeWithNewDestinations: CFRoute = {
        ...route,
        destinations: result.data.destinations,
      };

      emits('success', { route: routeWithNewDestinations });
    }
  };

  const createResult = await routeApi.create(finalInput);
  if (createResult.success) {
    route = createResult.data;

    linkRouteToApplication();
  } else {
    const conflictingRoutes = await loadPaginatedData((page) =>
      routeApi.list({
        page,
        domainGuids: [finalInput.domainGuid],
        hosts: finalInput.host ? [finalInput.host] : undefined,
        paths: finalInput.path ? [finalInput.path] : undefined,
      }),
    );

    if (conflictingRoutes.success) {
      if (conflictingRoutes.data.resources.length === 1) {
        route = conflictingRoutes.data.resources[0];

        state.value = {
          mode: 'confirm',
          route: route,
          cancel: () => {
            emits('cancel');
          },
          confirm: async () => {
            confirming.value = true;
            await linkRouteToApplication();
            confirming.value = false;
          },
        };
      } else {
        state.value = {
          mode: 'error',
          error: createResult.error,
          conflicts: conflictingRoutes.data.resources,
        };
      }
    } else {
      state.value = {
        mode: 'error',
        error: createResult.error,
      };
    }
  }
});
</script>

<template>
  <route-create-form v-if="state.mode === 'form'" :domains="domains" @submit="handleSubmit" :loading="loading">
  </route-create-form>

  <confirm-card
    v-else-if="state.mode === 'confirm'"
    @confirm="state.confirm"
    @cancel="state.cancel"
    :loading="confirming">
    <template #text>
      La route `{{ state.route.url }}` existe déjà, voulez-vous y connecter `{{ application.name }}` ?
    </template>
  </confirm-card>

  <v-card v-else>
    <v-card-text>
      <api-error-alert :error="state.error"></api-error-alert>
    </v-card-text>
  </v-card>
</template>
