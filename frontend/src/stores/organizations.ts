import { ApiErrorResponse } from '@/api';
import organizationApi from '@/api/organization';
import { CFOrganization, PaginatedOrganizations } from '@/models/cf/organization';
import { Result } from '@/utils/result';
import { defineStore } from 'pinia';

type OrganizationState = {
  loading: boolean;
  result: Result<PaginatedOrganizations, ApiErrorResponse> | undefined;
  filters: {
    text: string;
  };
  query: {
    page: number;
    perPage: number;
  };
};

export const useOrganizationsStore = defineStore('organizations', {
  persist: false,
  state: (): OrganizationState => ({
    loading: false,
    result: undefined,
    filters: {
      text: '',
    },
    query: {
      page: 1,
      perPage: 50,
    },
  }),
  getters: {
    organizations(): CFOrganization[] | undefined {
      if (!this.result?.success) return;
      return this.result.data.resources;
    },

    pagination(): { page: number; perPage: number; totalPages?: number; totalResults?: number } {
      const {
        result,
        query: { page, perPage },
      } = this;

      return {
        page,
        perPage,
        totalPages: result?.success ? result.data.pagination.total_pages : undefined,
        totalResults: result?.success ? result.data.pagination.total_results : undefined,
      };
    },
  },
  actions: {
    async fetchOrganizations() {
      this.loading = true;

      this.result = await organizationApi.getAll({
        page: this.query.page,
        perPage: this.query.perPage,
      });

      this.loading = false;
    },
  },
});
