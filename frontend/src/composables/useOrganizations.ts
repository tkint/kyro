import { buildApiErrorResponse, compactErrors } from '@/api';
import { useOrganizationQuotasStore } from '@/stores/organizationQuotas';
import { useOrganizationsStore } from '@/stores/organizations';
import { computed } from 'vue';

export default () => {
  const organizationsStore = useOrganizationsStore();
  const quotasStore = useOrganizationQuotasStore();

  return {
    loading: computed(() => organizationsStore.loading || quotasStore.loading),

    data: computed(() => {
      const { organizations } = organizationsStore;
      const { organizationQuotas } = quotasStore;

      if (organizations?.success && organizationQuotas?.success) {
        return {
          pagination: organizations.data.pagination,
          resources: organizations.data.resources.map((organization) => ({
            ...organization,
            quota: organizationQuotas.data.resources.find(
              (quota) => quota.guid === organization.relationships.quota.data.guid,
            ),
          })),
        };
      }
    }),

    error: computed(() => {
      const { organizations } = organizationsStore;
      const { organizationQuotas } = quotasStore;

      if (organizations?.success === false || organizationQuotas?.success === false) {
        const error = compactErrors(
          organizations?.success === false && organizations.error,
          organizationQuotas?.success === false && organizationQuotas.error,
        );

        return error ?? buildApiErrorResponse();
      }
    }),

    fetchData: () => {
      organizationsStore.fetchOrganizations();
      quotasStore.fetchQuotas();
    },
  };
};
