/**
 * Enum for message channel types
 */
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
 * Listener information
 */
export interface ListenerInfo {
  route: string;
  /**
   * The webContentsId of the listener, if the listener is the main process, it is -1
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
 * The data type sent by the main process to the renderer process when sending a listener
 */
export interface InvokeRenderInfo {
  /**
   * The id of the renderer process listener function
   */
  listenerId: number;
  /**
   * The way to call
   */
  type: 'boardcast' | 'invoke';
  /**
   * If it is invoke, the corresponding invokeId
   */
  invokeId?: number;
}

/**
 * The type of data returned by the renderer process to the main process when the main process invokes the renderer process
 */
export interface ReplayInfo {
  data: unknown;
  isSuccess: boolean;
  invokeId: number;
}

export interface IpcEvent {
  /**
   * The webContentsId of the sender, if the sender is the main process, it is -1
   */
  sourceId: number;
}

/**
 * The webContentsId of the main process
 */
export const MAIN_PROCESS_ID = -1;
