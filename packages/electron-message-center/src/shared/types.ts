import { IpcMainEvent, IpcRendererEvent } from 'electron';

export const enum MessageChannelEnum {
  RENDERER_TO_MAIN_BROADCAST = 'EMC:broadcast',
  RENDERER_TO_MAIN_ON = 'EMC:on',
  MAIN_TO_RENDERER_BROADCAST = 'EMC:broadcastCallback',
  RENDERER_TO_MAIN_OFF = 'EMC:off',
  RENDERER_TO_MAIN_GET_ALL_LISTENERS = 'EMC:getAllListeners',
}
export interface ListenerInfo {
  route: string;
  webContentId?: number;
  type: 'main' | 'renderer';
}

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
