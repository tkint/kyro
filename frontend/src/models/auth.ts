export interface AuthToken {
  access_token: string;
  token_type: 'bearer';
  id_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  jti: string;
}

export type ApiScope = 'openid' | 'uaa.user' | 'cloud_controller.read' | 'password.write' | 'cloud_controller.write';

export interface AuthJWT {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  jti?: string;
  exp?: number;
  iat?: number;

  scope: ApiScope[];
  client_id: string;
  cid: string;
  azp: string;
  grant_type: string;
  user_id: string;
  origin: string;
  user_name: string;
  email: string;
  auth_time: number;
  rev_sig: string;
  zid: string;
}
