import { ApiErrorResponse } from '@/api';
import organizationApi from '@/api/organization';
import { useLoadPaginatedData } from '@/composables/useLoadData';
import { CFOrganization, PaginatedOrganizations } from '@/models/cf/organization';
import { Result } from '@/utils/result';
import { defineStore } from 'pinia';

type OrganizationState = {
  loading: boolean;
  result: Result<PaginatedOrganizations, ApiErrorResponse> | undefined;
  filters: {
    text: string;
  };
};

const { loadData } = useLoadPaginatedData((page) =>
  organizationApi.getAll({
    page: page,
    perPage: 50,
  }),
);

export const useOrganizationsStore = defineStore('organizations', {
  persist: false,
  state: (): OrganizationState => ({
    loading: false,
    result: undefined,
    filters: {
      text: '',
    },
  }),
  getters: {
    organizations(): CFOrganization[] | undefined {
      if (!this.result?.success) return;
      return this.result.data.resources;
    },
  },
  actions: {
    async fetchOrganizations() {
      this.loading = true;

      this.result = await loadData();

      this.loading = false;
    },
  },
});
