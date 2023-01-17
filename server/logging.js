const url = require('url');
const WebSocket = require('ws');
const request = require('request');
const protobuf = require('protobufjs');

const loggingMiddleware = (server, loggingUrl) => {
  protobuf.load('proto/envelope.proto', (err, root) => {
    if (err) throw err;

    const Envelope = root.lookupType('events.Envelope');

    const wsServer = new WebSocket.WebSocketServer({ server });

    wsServer.on('connection', async (ws, req) => {
      const reqUrl = url.parse(req.url);
      const reqSearchParams = new URLSearchParams(reqUrl.search);
      const [_, resource, guid, action] = reqUrl.pathname.split('/');
      const authorization = reqSearchParams.get('authorization');
      const recent = reqSearchParams.get('recent') === 'true';

      if (recent) {
        const httpUrl = loggingUrl.replace(/^ws/, 'http');

        const headers = {
          Authorization: authorization,
        };

        request(
          `${httpUrl}/apps/${guid}/recentlogs`,
          { strictSSL: false, method: 'GET', headers, encoding: null },
          (err, res, body) => {
            if (err) {
              console.log(err);
            } else {
              if (res.statusCode === 404) {
                console.log(`GET ${res.request.uri.href} NOT FOUND`);
              } else {
                // Utiliser les boundaries avant de décoder...
                const message = Envelope.decode(body);
                ws.send(JSON.stringify(message.toJSON()));
              }
            }
          },
        );
      }

      const wsLogStream = new WebSocket(`${loggingUrl}/apps/${guid}/stream`, {
        rejectUnauthorized: false,
        headers: {
          Authorization: authorization,
        },
      });
      wsLogStream.on('open', () => {
        console.log(`Opened connection with logs for ${guid} on ${loggingUrl}`);
      });
      wsLogStream.on('error', (event) => {
        console.log('WS ERROR', event);
      });
      wsLogStream.on('message', (event) => {
        const message = Envelope.decode(event);

        ws.send(JSON.stringify(message.toJSON()));
      });
    });
  });
};

module.exports = {
  loggingMiddleware: loggingMiddleware,
};
