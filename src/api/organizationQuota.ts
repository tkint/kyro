import { handleApiCall } from '@/api';
import { CFOrganizationQuota, PaginatedOrganizationQuotas } from '@/models/cf/organizationQuota';
import { useAuthStore } from '@/stores/auth';

export default {
  getAll: async () => {
    return handleApiCall<PaginatedOrganizationQuotas>({
      path: '/v3/organization_quotas',
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
