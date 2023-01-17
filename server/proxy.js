const request = require('request');

const proxyMiddleware = (url) => {
  if (!url) {
    throw Error('Proxy URL mandatory');
  }
  console.log(`Mounted proxy for ${url}`);
  return (req, res) => {
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

    request(
      proxyUrlStr,
      { strictSSL: false, method: req.method, body: proxyBody, headers: proxyHeaders, json: isJson },
      (err, proxyRes, proxyBody) => {
        if (err) {
          console.log(err);
          res.status(500).send(err);
        } else {
          res.set(proxyRes.headers);
          res.status(proxyRes.statusCode).send(proxyBody);
        }
      },
    );
  };
};

module.exports = {
  proxyMiddleware,
};
