import { buildApiErrorResponse, compactErrors } from '@/api';
import { useOrganizationQuotasStore } from '@/stores/organizationQuotas';
import { useOrganizationsStore } from '@/stores/organizations';
import { filter, includes, some, upperCase } from 'lodash';
import { computed } from 'vue';

/**
 * TODO: Is it really useful ?
 */
export default () => {
  const organizationsStore = useOrganizationsStore();
  const quotasStore = useOrganizationQuotasStore();

  const data = computed(() => {
    const { organizations } = organizationsStore;
    const { quotas } = quotasStore;

    if (organizations && quotas) {
      return organizations.map((organization) => ({
        ...organization,
        quota: quotas.find((quota) => quota.guid === organization.relationships.quota.data.guid),
      }));
    }
  });

  return {
    loading: computed(() => organizationsStore.loading || quotasStore.loading),

    filters: organizationsStore.filters,

    data: data,

    filteredData: computed(() => {
      const { text } = organizationsStore.filters;
      const formattedText = upperCase(text);

      return filter(data.value, (organization) =>
        some([organization.name].map(upperCase), (value) => includes(value, formattedText)),
      );
    }),

    error: computed(() => {
      const { result: organizationsResult } = organizationsStore;
      const { result: organizationQuotasResult } = quotasStore;

      if (organizationsResult?.success === false || organizationQuotasResult?.success === false) {
        const error = compactErrors(
          organizationsResult?.success === false && organizationsResult.error,
          organizationQuotasResult?.success === false && organizationQuotasResult.error,
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
