import { handleApiCall, queryParams } from '@/api';
import { CFOrganization } from '@/models/cf/organization';
import { CFOrganizationQuota, PaginatedOrganizationQuotas } from '@/models/cf/organizationQuota';
import { useAuthStore } from '@/stores/auth';

export default {
  getAll: async (options?: Partial<{ organizationGuids: CFOrganization['guid'][] }>) => {
    return handleApiCall<PaginatedOrganizationQuotas>({
      path: '/v3/organization_quotas',
      query: queryParams({
        organization_guids: options?.organizationGuids?.join(','),
      }),
      authorization: useAuthStore().getAuthorization,
    });
  },
  getOne: async (guid: CFOrganizationQuota['guid']) => {
    return handleApiCall<CFOrganizationQuota>({
      path: `/v3/organization_quotas/${guid}`,
      authorization: useAuthStore().getAuthorization,
    });
  },
};
