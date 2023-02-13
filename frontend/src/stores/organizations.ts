import { ApiErrorResponse } from '@/api';
import organizationApi from '@/api/organization';
import { PaginatedOrganizations } from '@/models/cf/organization';
import { Result } from '@/utils/result';
import { defineStore } from 'pinia';

type OrganizationState = {
  loading: boolean;
  organizations: Result<PaginatedOrganizations, ApiErrorResponse> | undefined;
};

export const useOrganizationsStore = defineStore('organizations', {
  persist: false,
  state: (): OrganizationState => ({
    loading: false,
    organizations: undefined,
  }),
  getters: {},
  actions: {
    async fetchOrganizations() {
      this.loading = true;
      this.organizations = await organizationApi.getAll();
      this.loading = false;
    },
  },
});
