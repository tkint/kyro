import dayjs, { Dayjs } from 'dayjs';
import { decodeJwt } from 'jose';
import { defineStore } from 'pinia';
import { capitalize } from 'vue';
import authApi from '@/api/auth';
import { ApiScope, AuthJWT, AuthToken } from '@/models/auth';

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
    decodedToken(): AuthJWT {
      if (!this.authToken) throw Error('Token undefined');
      const payload = decodeJwt(this.authToken.access_token);

      return {
        iss: payload.iss,
        sub: payload.sub,
        aud: payload.aud,
        jti: payload.jti,
        exp: payload.exp,
        iat: payload.iat,

        scope: payload.scope as ApiScope[],
        client_id: payload.client_id as string,
        cid: payload.cid as string,
        azp: payload.azp as string,
        grant_type: payload.grant_type as string,
        user_id: payload.user_id as string,
        origin: payload.origin as string,
        user_name: payload.user_name as string,
        email: payload.email as string,
        auth_time: payload.auth_time as number,
        rev_sig: payload.rev_sig as string,
        zid: payload.zid as string,
      };
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
