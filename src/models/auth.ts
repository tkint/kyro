export interface AuthToken {
  access_token: string;
  token_type: 'bearer';
  id_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  jti: string;
}
