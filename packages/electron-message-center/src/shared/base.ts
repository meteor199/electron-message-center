import type { IpcMainEvent, IpcRendererEvent } from 'electron';

type IpcEvent = IpcRendererEvent & IpcMainEvent;

/**
 * For backwards compatibility, event is the (optional) LAST argument to a listener function.
 * This leads to the following verbose overload type for a listener function.
 */
export type Listener = { (...args: any): void };
export type Options = { maxTimeoutMs?: number };
// There's an `any` here it's the only way that the typescript compiler allows you to call listener(...dataArgs, event).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WrappedListener = { (event: IpcEvent, replyChannel: string, ...dataArgs: any[]): void };

export abstract class MessageCenterBase {
  public constructor(opts: { maxTimeoutMs?: number } | undefined) {
    //
  }

  public abstract broadcast(route: string, ...dataArgs: unknown[]): void;
  public abstract on(route: string, listener: Listener): void;
  public abstract off(route: string, listener?: Listener): void;
}

let id = 0;

export function createId() {
  return id++;
}
