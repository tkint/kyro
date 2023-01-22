import fs from 'fs';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import request from 'request';

import { proxyMiddleware } from './proxy';
import { loggingMiddleware } from './logging';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Loading environment variables
let dotenvPath = `.env${IS_PRODUCTION ? '.production' : ''}`;
const dotenvLocalPath = `${dotenvPath}.local`;
if (fs.existsSync(dotenvLocalPath)) {
  dotenvPath = dotenvLocalPath;
}
console.log(`Env file : ${dotenvPath}`);
dotenv.config({
  path: dotenvPath,
});

type Infos = {
  apiUrl: string;
  loginUrl: string;
  loggingUrl: string;
  logCacheUrl: string;
  logStreamUrl: string;
};

new Promise<Infos>((resolve) => {
  const apiUrl = process.env.API_URL as string;

  request(apiUrl, { strictSSL: false, json: true }, (err, res) => {
    if (err) throw err;

    const { links } = res.body;

    resolve({
      apiUrl: apiUrl,
      loginUrl: links.login.href,
      loggingUrl: links.logging.href,
      logCacheUrl: links.log_cache.href,
      logStreamUrl: links.log_stream.href,
    });
  });
}).then(({ apiUrl, loginUrl, loggingUrl }) => {
  const app = express();
  const server = http.createServer(app);

  app.use(cors());

  app.use('/api', express.json(), proxyMiddleware(apiUrl));

  app.use('/login', bodyParser.text({ type: 'application/x-www-form-urlencoded' }), proxyMiddleware(loginUrl));

  loggingMiddleware(server, loggingUrl);

  if (IS_PRODUCTION) {
    const frontendDir = `${__dirname}/frontend/`;
    app.use(express.static(frontendDir));
    app.get('/', function (_, res) {
      res.sendFile(`${frontendDir}index.html`);
    });
  }

  const port = process.env.PORT || 8080;
  server.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
});
