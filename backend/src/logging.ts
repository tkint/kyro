import { Server } from 'http';
import protobuf from 'protobufjs';
import request from 'request';
import url from 'url';
import { WebSocket, WebSocketServer } from 'ws';

export const loggingMiddleware = (server: Server, loggingUrl: string) => {
  protobuf.load('proto/envelope.proto', (err, root) => {
    if (!root) throw Error('Root undefined');
    if (err) throw err;

    const Envelope = root.lookupType('events.Envelope');

    const wsServer = new WebSocketServer({ server });

    wsServer.on('connection', async (ws, req) => {
      const reqUrl = url.parse(req.url ?? '');
      const reqSearchParams = new URLSearchParams(reqUrl.search ?? {});
      const [_, __, guid, ___] = (reqUrl.pathname ?? '').split('/');
      const authorization = reqSearchParams.get('authorization') ?? '';
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
        // @ts-ignore
        const message = Envelope.decode(event);

        ws.send(JSON.stringify(message.toJSON()));
      });
    });
  });
};
