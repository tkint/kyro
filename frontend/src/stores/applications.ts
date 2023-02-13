import { ApiErrorResponse } from '@/api';
import applicationApi from '@/api/application';
import { PaginatedApplications } from '@/models/cf/application';
import { Result } from '@/utils/result';
import { defineStore } from 'pinia';

type ApplicationsState = {
  loading: boolean;
  applications: Result<PaginatedApplications, ApiErrorResponse> | undefined;
};

export const useApplicationsStore = defineStore('applications', {
  persist: false,
  state: (): ApplicationsState => ({
    loading: false,
    applications: undefined,
  }),
  getters: {},
  actions: {
    async fetchApplications() {
      this.loading = true;
      this.applications = await applicationApi.getAll();
      this.loading = false;
    },
  },
});
