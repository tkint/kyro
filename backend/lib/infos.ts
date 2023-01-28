import axios from 'axios';
import { insecureHttpsAgent } from './agent';

type Infos = {
  apiUrl: string;
  loginUrl: string;
  loggingUrl: string;
  logCacheUrl: string;
  logStreamUrl: string;
};

export const getInfos = async (): Promise<Infos> => {
  let apiUrl = process.env.API_URL;

  if (!apiUrl) {
    const vcapApplication = process.env.VCAP_APPLICATION;
    if (vcapApplication) {
      apiUrl = JSON.parse(vcapApplication).cf_api;
    }
  }

  if (!apiUrl) throw Error('API Url not defined');

  const response = await axios.get(apiUrl, {
    proxy: false,
    httpsAgent: insecureHttpsAgent,
  });

  const { links } = response.data;

  return {
    apiUrl: apiUrl,
    loginUrl: links.login.href,
    loggingUrl: links.logging.href,
    logCacheUrl: links.log_cache.href,
    logStreamUrl: links.log_stream.href,
  };
};
