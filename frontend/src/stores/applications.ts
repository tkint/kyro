import { ApiErrorResponse } from '@/api';
import applicationApi from '@/api/application';
import { PaginatedApplications } from '@/models/cf/application';
import { Result } from '@/utils/result';
import { defineStore } from 'pinia';

type ApplicationsState = {
  loading: boolean;
  result: Result<PaginatedApplications, ApiErrorResponse> | undefined;
};

export const useApplicationsStore = defineStore('applications', {
  persist: false,
  state: (): ApplicationsState => ({
    loading: false,
    result: undefined,
  }),
  getters: {},
  actions: {
    async fetchApplications() {
      this.loading = true;

      this.result = await applicationApi.getAll();

      this.loading = false;
    },
  },
});
