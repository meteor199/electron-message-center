export const enum MessageChannelEnum {
  RENDERER_TO_MAIN_BROADCAST = 'EMC:broadcast',
  RENDERER_TO_MAIN_INVOKE = 'EMC:invoke',
  RENDERER_TO_MAIN_ON = 'EMC:on',
  MAIN_TO_RENDERER_CALLBACK = 'EMC:callback',
  RENDERER_TO_MAIN_REPLAY = 'EMC:replay',
  RENDERER_TO_MAIN_OFF = 'EMC:off',
  RENDERER_TO_MAIN_GET_ALL_LISTENERS = 'EMC:getAllListeners',
}
export interface ListenerInfo {
  route: string;
  webContentId?: number;
  type: 'main' | 'renderer';
}

/**
 * For backwards compatibility, event is the (optional) LAST argument to a listener function.
 * This leads to the following verbose overload type for a listener function.
 */
export type Listener = { (event: IpcEvent, ...args: any[]): void | any | Promise<any> };
export type Options = { maxTimeoutMs?: number };

/**
 * 主进程发送给渲染进程的监听者时，发送的数据类型
 */
export interface CallbackInfo {
  id: number;
  type: 'boardcast' | 'invoke';
  invokeId?: number;
}

/**
 * 当主进程invoke渲染进程时，渲染进程回复给主进程的类型
 */
export interface ReplayInfo {
  data: unknown;
  isSuccess: boolean;
  invokeId: number;
}

export interface IpcEvent {
  /**
   * 发送方的webContentsId，假如是发送方是主进程，则为-1，
   */
  sourceId: number;
}

/**
 * 主进程 webContentsId;
 */
export const MAIN_PROCESS_ID = -1;
