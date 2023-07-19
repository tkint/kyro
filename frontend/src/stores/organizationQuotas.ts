import { ApiErrorResponse } from '@/api';
import organizationQuotaApi from '@/api/organizationQuota';
import { CFOrganization } from '@/models/cf/organization';
import { CFOrganizationQuota, PaginatedOrganizationQuotas } from '@/models/cf/organizationQuota';
import { Result } from '@/utils/result';
import { defineStore } from 'pinia';

type OrganizationQuotasState = {
  loading: boolean;
  result: Result<PaginatedOrganizationQuotas, ApiErrorResponse> | undefined;
};

export const useOrganizationQuotasStore = defineStore('organizationQuotas', {
  persist: false,
  state: (): OrganizationQuotasState => ({
    loading: false,
    result: undefined,
  }),
  getters: {
    quotas(): CFOrganizationQuota[] | undefined {
      if (!this.result?.success) return;
      return this.result.data.resources;
    },
  },
  actions: {
    async fetchQuotas() {
      this.loading = true;

      this.result = await organizationQuotaApi.getAll();

      this.loading = false;
    },

    async fetchQuotasForOrganizations(organizationGuids: CFOrganization['guid'][]) {
      this.loading = true;

      this.result = await organizationQuotaApi.getAll({ organizationGuids });

      this.loading = false;
    },
  },
});
