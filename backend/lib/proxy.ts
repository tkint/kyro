import axios, { AxiosError } from 'axios';
import { RequestHandler } from 'express';
import { insecureHttpsAgent } from './agent';

export const proxyMiddleware: (url: string) => RequestHandler = (url) => {
  if (!url) {
    throw Error('Proxy URL mandatory');
  }
  console.log(`Mounted proxy for ${url}`);

  return async (req, res) => {
    const headers = req.headers;
    const proxyHeaders = {
      authorization: headers['authorization'],
      'content-type': headers['content-type'],
    };

    const proxyUrl = new URL(url);
    const [path, params] = req.url.split('?');
    if (path) {
      proxyUrl.pathname = path;
    }
    if (params) {
      proxyUrl.search = params;
    }

    const proxyUrlStr = proxyUrl.href;
    console.log(req.method, req.baseUrl, path, params ?? '', req.body ? '[body]' : '');

    const isJson = proxyHeaders['content-type'] === 'application/json';
    let proxyBody = undefined;
    if (req.body && Object.keys(req.body).length) {
      if (isJson) {
        proxyBody = req.body;
      } else {
        proxyBody = req.body;
      }
    }

    try {
      const response = await axios.request({
        url: proxyUrlStr,
        httpsAgent: insecureHttpsAgent,
        method: req.method,
        data: proxyBody,
        headers: proxyHeaders,
        responseType: isJson ? 'json' : 'text',
        proxy: false,
      });

      res.set(response.headers);
      res.status(response.status).send(response.data);
    } catch (err) {
      if (err instanceof AxiosError) {
        const { response } = err;
        res.status(response?.status ?? 500).send(response?.data ?? err.message);
      } else {
        res.status(500).send(err);
      }
    }
  };
};
