const fs = require('fs');
const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const request = require('request');

const { proxyMiddleware } = require('./proxy');
const { loggingMiddleware } = require('./logging');

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

new Promise((resolve) => {
  const apiUrl = process.env.API_URL;

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

  server.listen(process.env.PORT || 8080, () => {
    console.log(`Server started on port ${server.address().port}`);
  });
});
