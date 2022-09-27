export enum CFEventType {
  HttpStartStop = 'HttpStartStop',
  LogMessage = 'LogMessage',
  ValueMetric = 'ValueMetric',
  CounterEvent = 'CounterEvent',
  Error = 'Error',
  ContainerMetric = 'ContainerMetric',
}

export type CFEvent = {
  origin: string;
  timestamp?: number;
  deployment?: string;
  job?: string;
  index?: string;
  ip?: string;
  tags?: Record<string, string>;
} & (
  | {
      eventType: CFEventType.LogMessage;
      logMessage: CFEvent.LogMessage;
    }
  | {
      eventType: CFEventType.ValueMetric;
      valueMetric: CFEvent.ValueMetric;
    }
  | {
      eventType: CFEventType.CounterEvent;
      counterEvent: CFEvent.CounterEvent;
    }
  | {
      eventType: CFEventType.Error;
      error: CFEvent.Error;
    }
  | {
      eventType: CFEventType.ContainerMetric;
      containerMetric: CFEvent.ContainerMetric;
    }
);

export namespace CFEvent {
  export interface LogMessage {
    message: string;
    messageType: LogMessage.MessageType;
    timestamp: number;
    appId?: string;
    sourceType?: string;
    sourceInstance?: string;
  }

  export namespace LogMessage {
    export enum MessageType {
      OUT = 'OUT',
      ERR = 'ERR',
    }
  }

  export interface ValueMetric {
    name: string;
    value: number;
    unit: string;
  }

  export interface CounterEvent {
    name: string;
    delta: number;
    total?: number;
  }

  export interface Error {
    source: string;
    code: number;
    message: string;
  }

  export interface ContainerMetric {
    applicationId: string;
    instanceIndex: number;
    cpuPercentage: number;
    memoryBytes: number;
    diskBytes: number;
    memoryBytesQuota?: number;
    diskBytesQuota?: number;
  }
}
