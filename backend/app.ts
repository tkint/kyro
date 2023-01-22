import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import http from 'http';

import { getInfos } from './lib/infos';
import { loggingMiddleware } from './lib/logging';
import { proxyMiddleware } from './lib/proxy';

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

getInfos().then(({ apiUrl, loginUrl, loggingUrl }) => {
  const app = express();
  const server = http.createServer(app);

  app.use(cors());

  app.use('/api', express.json(), proxyMiddleware(apiUrl));

  app.use('/login', bodyParser.text({ type: 'application/x-www-form-urlencoded' }), proxyMiddleware(loginUrl));

  loggingMiddleware(server, loggingUrl);

  if (IS_PRODUCTION) {
    const frontendDir = `${__dirname}/public/`;
    app.use(express.static(frontendDir));
    app.get('/', (_, res) => {
      res.sendFile(`${frontendDir}index.html`);
    });
  }

  const port = process.env.PORT || 8080;
  server.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
});
