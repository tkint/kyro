import { Agent } from 'https';

export const insecureHttpsAgent = new Agent({
  rejectUnauthorized: false,
});
