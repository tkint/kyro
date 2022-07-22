import dayjs, { Dayjs } from 'dayjs';
import { defineStore } from 'pinia';
import { capitalize } from 'vue';
import authApi from '@/api/auth';
import { AuthToken } from '@/models/auth';

type AuthState = {
  authToken?: AuthToken & { lastDemand: Dayjs };
};

export const useAuthStore = defineStore('auth', {
  persist: true,
  state: (): AuthState => ({
    authToken: undefined,
  }),
  getters: {
    isLogged(): boolean {
      return !!this.authToken;
    },
  },
  actions: {
    async initToken(options: { username: string; password: string }): Promise<AuthToken | undefined> {
      const response = await authApi.getAuthToken(options);
      if (response.success) {
        this.authToken = { ...response.data, lastDemand: dayjs() };
      } else {
        this.authToken = undefined;
      }
      return undefined;
    },

    async getToken(): Promise<AuthToken | undefined> {
      if (this.authToken) {
        const expirationDate = dayjs(this.authToken.lastDemand).add(this.authToken.expires_in, 'seconds');
        if (dayjs().isAfter(expirationDate)) {
          const response = await authApi.renewToken(this.authToken);
          if (response.success) {
            this.authToken = { ...response.data, lastDemand: dayjs() };
          } else {
            this.authToken = undefined;
          }
        }
      }
      return this.authToken;
    },

    async getAuthorization(): Promise<string | undefined> {
      const token = await this.getToken();
      return token && `${capitalize(token.token_type)} ${token.access_token}`;
    },
  },
});
