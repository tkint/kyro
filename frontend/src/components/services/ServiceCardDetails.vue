<script setup lang="ts">
import { ServiceDetails } from '@/components/services/models';
import CopyableText from '@/components/shared/CopyableText.vue';
import { formatDate } from '@/utils/date';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  service: ServiceDetails;
}>();

const { t } = useI18n();
</script>

<template>
  <v-card>
    <v-card-title>{{ service.name }}</v-card-title>

    <v-card-text>
      <v-container class="px-0">
        <v-row>
          <v-col>
            <v-card>
              <v-card-title>{{ t('service.instance.title') }}</v-card-title>

              <v-card-text>
                <v-row>
                  <v-col>
                    <div>Type</div>
                    <div>{{ service.type }}</div>
                  </v-col>

                  <v-col>
                    <div>Guid<copyable-text :text="service.guid"></copyable-text></div>
                    <div>{{ service.guid }}</div>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <div>Création</div>
                    <div>{{ formatDate(service.created_at, 'DD/MM/YYYY HH:mm:ss') }}</div>
                  </v-col>

                  <v-col>
                    <div>Mise à jour</div>
                    <div>{{ formatDate(service.updated_at, 'DD/MM/YYYY HH:mm:ss') }}</div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col class="text-no-wrap">
            <v-card>
              <v-card-title>Binding</v-card-title>

              <v-card-text>
                <v-row>
                  <v-col>
                    <div>Type</div>
                    <div>{{ service.type }}</div>
                  </v-col>

                  <v-col>
                    <div>Guid<copyable-text :text="service.binding.guid"></copyable-text></div>
                    <div>{{ service.binding.guid }}</div>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <div>Création</div>
                    <div>{{ formatDate(service.binding.created_at, 'DD/MM/YYYY HH:mm:ss') }}</div>
                  </v-col>

                  <v-col>
                    <div>Mise à jour</div>
                    <div>{{ formatDate(service.binding.updated_at, 'DD/MM/YYYY HH:mm:ss') }}</div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-card>
              <v-card-title>Dernière opération</v-card-title>

              <v-card-text>
                <v-row>
                  <v-col>
                    <div>Type</div>
                    <div>{{ service.last_operation.type }}</div>
                  </v-col>

                  <v-col>
                    <div>State</div>
                    <div>{{ service.last_operation.state }}</div>
                  </v-col>

                  <v-col>
                    <div>Création</div>
                    <div>{{ formatDate(service.last_operation.created_at, 'DD/MM/YYYY HH:mm:ss') }}</div>
                  </v-col>

                  <v-col>
                    <div>Mise à jour</div>
                    <div>{{ formatDate(service.last_operation.updated_at, 'DD/MM/YYYY HH:mm:ss') }}</div>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-sheet>
                      {{ service.last_operation.description }}
                    </v-sheet>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-if="service.details">
          <v-col>
            <v-card>
              <v-card-title>Details</v-card-title>

              <v-card-text>
                <v-code tag="pre">{{ JSON.stringify(service.details, null, 2) }}</v-code>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>
