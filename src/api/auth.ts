import { AuthToken } from '@/models/auth';
import { handleApiCall } from '.';

export default {
  getAuthToken: (options: { username: string; password: string }) => {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('password', options.password);
    formData.append('username', options.username);

    return handleApiCall<AuthToken>({
      path: '/oauth/token',
      method: 'POST',
      contentType: 'xml',
      body: formData,
      authorization: `Basic ${btoa('cf:')}`,
      endpoint: 'loginUrl',
    });
  },

  renewToken: (token: AuthToken) => {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'refresh_token');
    formData.append('refresh_token', token.refresh_token);

    return handleApiCall<AuthToken>({
      path: '/oauth/token',
      method: 'POST',
      contentType: 'xml',
      body: formData,
      authorization: `Basic ${btoa('cf:')}`,
      endpoint: 'loginUrl',
    });
  },
};
