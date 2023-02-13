import { ApiErrorResponse } from '@/api';
import organizationQuotaApi from '@/api/organizationQuota';
import { PaginatedOrganizationQuotas } from '@/models/cf/organizationQuota';
import { Result } from '@/utils/result';
import { defineStore } from 'pinia';

type OrganizationQuotasState = {
  loading: boolean;
  organizationQuotas: Result<PaginatedOrganizationQuotas, ApiErrorResponse> | undefined;
};

export const useOrganizationQuotasStore = defineStore('organizationQuotas', {
  persist: false,
  state: (): OrganizationQuotasState => ({
    loading: false,
    organizationQuotas: undefined,
  }),
  getters: {},
  actions: {
    async fetchQuotas() {
      this.loading = true;
      this.organizationQuotas = await organizationQuotaApi.getAll();
      this.loading = false;
    },
  },
});
