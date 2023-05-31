export const enum MessageChannelEnum {
  RENDERER_TO_MAIN_BROADCAST = 'EMC:broadcast',
  RENDERER_TO_MAIN_INVOKE = 'EMC:invoke',
  RENDERER_TO_MAIN_ON = 'EMC:on',
  MAIN_TO_RENDERER_CALLBACK = 'EMC:callback',
  RENDERER_TO_MAIN_REPLAY = 'EMC:replay',
  RENDERER_TO_MAIN_OFF = 'EMC:off',
  RENDERER_TO_MAIN_GET_ALL_LISTENERS = 'EMC:getAllListeners',
}

/**
 * listener info
 */
export interface ListenerInfo {
  route: string;
  /**
   * 监听方的webContentsId，假如是监听方是主进程，则为-1，
   */
  webContentId: number;
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
export interface InvokeRenderInfo {
  /**
   * 渲染进程监听函数的id
   */
  listenerId: number;
  /**
   * 调用的方式
   */
  type: 'boardcast' | 'invoke';
  /**
   * 假如是invoke，对应的invokeId。
   */
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
