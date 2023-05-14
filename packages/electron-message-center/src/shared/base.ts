import { Listener, ListenerInfo } from './types';

export abstract class MessageCenterBase {
  public constructor(opts: { maxTimeoutMs?: number } | undefined) {
    //
  }

  public abstract broadcast(route: string, ...dataArgs: unknown[]): void;
  public abstract on(route: string, listener: Listener): void;
  public abstract off(route: string, listener?: Listener): void;
  public abstract getAllListeners(route?: string): Promise<ListenerInfo[]>;
}
