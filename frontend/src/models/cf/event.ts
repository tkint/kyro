export enum CFEventType {
  Log = 'Log',
  Gauge = 'Gauge',
  Timer = 'Timer',
  None = 'None',
}

export type CFEvent = {
  timestamp: string;
  source_id: string;
  instance_id: string;
  deprecated_tags: Record<string, string>;
  tags: Record<string, string>;
} & (
  | {
      type: CFEventType.Log;
      log: CFEvent.Log;
    }
  | {
      type: CFEventType.Gauge;
      gauge: CFEvent.Gauge;
    }
  | {
      type: CFEventType.Timer;
      timer: CFEvent.Timer;
    }
  | {
      type: CFEventType.None;
    }
);

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
    metrics: Gauge.Metrics;
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
