import axios, { AxiosError } from 'axios';
import { Server } from 'http';
import { type } from 'os';
import { parse as parseUrl } from 'url';
import { WebSocketServer } from 'ws';
import { insecureHttpsAgent } from './agent';

export const loggingMiddleware = (server: Server, logCacheUrl: string) => {
  const wsServer = new WebSocketServer({ server });

  wsServer.on('connection', async (ws, req) => {
    const reqUrl = parseUrl(req.url ?? '');

    const [_, __, appGuid, ___] = (reqUrl.pathname ?? '').split('/');

    const reqSearchParams = new URLSearchParams(reqUrl.search ?? {});
    const authorization = reqSearchParams.get('authorization') ?? '';
    const recent = reqSearchParams.get('recent') === 'true';

    const appLogUrl = new URL(`${logCacheUrl}/api/v1/read/${appGuid}`);
    appLogUrl.searchParams.set('descending', 'true');
    appLogUrl.searchParams.set('envelope_types', 'LOG');
    appLogUrl.searchParams.set('limit', '1000');

    const headers = {
      Authorization: authorization,
    };

    const delayInSeconds = 1;

    const streamLogs = async (timestamp: number): Promise<number> => {
      let nextTimestamp = timestamp;
      try {
        appLogUrl.searchParams.set('start_time', nextTimestamp.toString());

        const response = await axios.get<LogResponse>(appLogUrl.href, {
          headers,
          proxy: false,
          httpsAgent: insecureHttpsAgent,
        });

        if (response.status === 404) {
          console.log(`GET ${appLogUrl} NOT FOUND`);
        } else {
          const envelopes = response.data.envelopes.batch.sort((a, b) =>
            a.timestamp > b.timestamp ? 1 : a.timestamp < b.timestamp ? -1 : 0,
          );

          const latestEnvelope = envelopes[envelopes.length - 1];
          if (latestEnvelope) {
            const latestEnvelopeTimestamp = parseInt(latestEnvelope.timestamp);
            nextTimestamp = latestEnvelopeTimestamp + 1000000;
          }

          envelopes.forEach((envelope) => {
            const typedEnvelope: Envelope & { type: EnvelopeType } = {
              ...envelope,
              type: envelope.log
                ? EnvelopeType.Log
                : envelope.timer
                ? EnvelopeType.Timer
                : envelope.gauge
                ? EnvelopeType.Gauge
                : EnvelopeType.None,
            };

            ws.send(JSON.stringify(typedEnvelope));
          });
        }
      } catch (e) {
        if (e instanceof AxiosError) {
          console.error(`GET ${appLogUrl} ${e.response?.status} ${e.code} ${e.response?.data}`);
        } else {
          console.error(e);
        }
        ws.close();
      }
      return nextTimestamp;
    };

    let timestamp = Date.now() * 1000000;

    if (recent) {
      streamLogs(-timestamp);
    }

    const interval = setInterval(async () => {
      timestamp = await streamLogs(timestamp);
    }, delayInSeconds * 1000);

    ws.on('close', () => {
      clearInterval(interval);
    });
  });
};

interface LogResponse {
  envelopes: Envelopes;
}

interface Envelopes {
  batch: Envelope[];
}

export enum EnvelopeType {
  Log = 'Log',
  Gauge = 'Gauge',
  Timer = 'Timer',
  None = 'None',
}

export type Envelope = {
  timestamp: string;
  source_id: string;
  instance_id: string;
  deprecated_tags: Record<string, string>;
  tags: Record<string, string>;
  log?: CFEvent.Log;
  gauge?: CFEvent.Gauge;
  timer?: CFEvent.Timer;
};

export namespace CFEvent {
  export interface Log {
    payload: string;
    type: Log.Type;
  }

  export namespace Log {
    export enum Type {
      OUT = 'OUT',
      ERR = 'ERR',
    }
  }

  export interface Timer {
    name: string;
    start: string;
    stop: string;
  }

  export interface Gauge {
    name: string;
    value: number;
    unit: string;
  }

  export namespace Gauge {
    export type Metrics = {
      spike_end?: Metric;
      spike_start?: Metric;
      absolute_entitlement?: Metric;
      absolute_usage?: Metric;
      container_age?: Metric;
      disk?: Metric;
      memory?: Metric;
      cpu?: Metric;
      disk_quota?: Metric;
      memory_quota?: Metric;
      log_rate_limit?: Metric;
      log_rate?: Metric;
    };

    export interface Metric {
      unit: string;
      value: number;
    }
  }
}
