const fs = require('fs');
const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const url = require('url');
const cors = require('cors');
const bodyParser = require('body-parser');
const request = require('request');
const WebSocket = require('ws');
const protobuf = require('protobufjs');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

let dotenvPath = `.env${IS_PRODUCTION ? '.production' : ''}`;
const dotenvLocalPath = `${dotenvPath}.local`;
if (fs.existsSync(dotenvLocalPath)) {
  dotenvPath = dotenvLocalPath;
}
console.log(`Env file : ${dotenvPath}`);
dotenv.config({
  path: dotenvPath,
});

const app = express();
const server = http.createServer(app);

const customProxyMiddleware = (url) => {
  if (!url) {
    throw Error('Proxy URL mandatory');
  }
  console.log(`Mounted proxy for ${url}`);
  return (req, res) => {
    const headers = req.headers;
    const proxyHeaders = Object.fromEntries(
      Object.entries(headers).filter(([key, _]) => {
        return ['authorization', 'content-type'].includes(key.toLowerCase());
      }),
    );

    const proxyUrl = new URL(url);
    const [reqPath, reqParams] = req.url.split('?');
    if (reqPath) {
      proxyUrl.pathname = reqPath;
    }
    if (reqParams) {
      proxyUrl.search = reqParams;
    }

    const proxyUrlStr = proxyUrl.href;
    console.log(req.method, req.baseUrl, reqPath, reqParams ?? '', req.body ? '[body]' : '');

    request(
      proxyUrlStr,
      { strictSSL: false, method: req.method, body: req.body, headers: proxyHeaders, json: false },
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

app.use(cors());

app.use('/api', customProxyMiddleware(process.env.API_URL));

app.use(
  '/login',
  bodyParser.text({ type: 'application/x-www-form-urlencoded' }),
  customProxyMiddleware(process.env.LOGIN_URL),
);

protobuf.load('proto/envelope.proto', (err, root) => {
  if (err) throw err;

  const Envelope = root.lookupType('events.Envelope');

  const wss = new WebSocket.WebSocketServer({ server });

  wss.on('connection', async (ws, request) => {
    const dopplerUrl = process.env.DOPPLER_URL;

    const reqUrl = url.parse(request.url);
    const reqSearchParams = new URLSearchParams(reqUrl.search);
    const [_, resource, guid, action] = reqUrl.pathname.split('/');
    const authorization = reqSearchParams.get('authorization');

    const wsDoppler = new WebSocket(`${dopplerUrl}/apps/${guid}/stream`, {
      rejectUnauthorized: false,
      headers: {
        Authorization: authorization,
      },
    });
    wsDoppler.on('open', () => {
      console.log(`Opened connection with logs for ${guid} on ${dopplerUrl}`);
    });
    wsDoppler.on('error', (event) => {
      console.log('WS ERROR', event);
    });
    wsDoppler.on('message', (event) => {
      const message = Envelope.decode(event);

      ws.send(JSON.stringify(message.toJSON()));
    });
  });
});

if (IS_PRODUCTION) {
  const frontendDir = `${__dirname}/frontend/`;
  app.use(express.static(frontendDir));
  app.get('/', function (_, res) {
    res.sendFile(`${frontendDir}index.html`);
  });
}

server.listen(process.env.PORT || 8080, () => {
  console.log(`Server started on port ${server.address().port}`);
});
