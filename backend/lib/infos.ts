import request from 'request';

type Infos = {
  apiUrl: string;
  loginUrl: string;
  loggingUrl: string;
  logCacheUrl: string;
  logStreamUrl: string;
};

export const getInfos = () =>
  new Promise<Infos>((resolve) => {
    let apiUrl = process.env.API_URL;

    if (!apiUrl) {
      const vcapApplication = process.env.VCAP_APPLICATION;
      if (vcapApplication) {
        apiUrl = JSON.parse(vcapApplication).cf_api;
      }
    }

    if (!apiUrl) throw Error('API Url not defined');

    request(apiUrl, { strictSSL: false, json: true }, (err, res) => {
      if (err) throw err;

      const { links } = res.body;

      resolve({
        apiUrl: apiUrl!,
        loginUrl: links.login.href,
        loggingUrl: links.logging.href,
        logCacheUrl: links.log_cache.href,
        logStreamUrl: links.log_stream.href,
      });
    });
  });
