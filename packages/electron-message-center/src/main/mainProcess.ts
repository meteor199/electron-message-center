import { ipcMain, WebContents } from 'electron';  
import {
  ListenerInfo,
  MessageChannelEnum,
  Listener,
  remove,
  InvokeRenderInfo,
  ReplayInfo,
  IpcEvent,
  MAIN_PROCESS_ID,
  Options,
  createId,
  withTimeout,
} from '../shared';

interface ListenerItem {
  /**
   * message channel
   */
  route: string;

  /**
   * callback function's id
   */
  listenerId: number;
  /**
   * sender renderer
   */
  rendererWebContents?: WebContents;

  /**
   * main process listener
   */
  mainListener?: Listener;

  webContentsId: number;
}
/**
 * List of listeners
 */
export const listenerList: ListenerItem[] = [];

/**
 * Record the webcontents that listen to the close event. When this webcontents has no listeners, the close event listener should be deleted.
 */
export const webContentsMap = new WeakMap<
  WebContents,
  {
    data: Set<ListenerItem>;
    removeListener: () => void;
  }
>();

/**
 * invoke callback map
 * key is invokeId
 */
export const invokeCallbackMap = new Map<
  number,
  {
    webContent: WebContents;
    successCallback: (value: unknown) => void;
    errorCallback: (err: Error) => void;
  }
>();

/**
 * dispose broadcast
 * @param info message info
 * @param args arguments
 */
export function disposeBroadcast(info: { route: string; sourceId: number; opts?: Options }, ...args: unknown[]) {
  const filteredListeners = filterListeners(info);

  filteredListeners.forEach(item => {
    const callbackParams: InvokeRenderInfo = {
      listenerId: item.listenerId,
      type: 'boardcast',
    };

    const event: IpcEvent = {
      sourceId: info.sourceId,
    };
    // renderer process
    if (item.rendererWebContents) {
      item.rendererWebContents.send(MessageChannelEnum.MAIN_TO_RENDERER_CALLBACK, event, callbackParams, ...args);
    } else {
      item.mainListener!(event, ...args);
    }
  });
}

function findListeners(info: { route: string; opts?: Options }) {
  const ids = info?.opts?.webContentsId;

  if (ids) {
    if (typeof ids === 'number') {
      return listenerList.find(item => item.route === info.route && item.webContentsId === ids);
    }
    return listenerList.find(item => item.route === info.route && ids.includes(item.webContentsId));
  }
  return listenerList.find(item => item.route === info.route);
}

function filterListeners(info: { route: string; opts?: Options }) {
  const ids = info?.opts?.webContentsId;

  if (ids) {
    if (typeof ids === 'number') {
      return listenerList.filter(item => item.route === info.route && item.webContentsId === ids);
    }
    return listenerList.filter(item => item.route === info.route && ids.includes(item.webContentsId));
  }
  return listenerList.filter(item => item.route === info.route);
}

/**
 * dispose invoke
 * @param info message info
 * @param args arguments
 */
export function disposeInvoke(info: { route: string; sourceId: number; opts?: Options }, ...args: unknown[]) {
  const item = findListeners(info);

  if (!item) {
    return Promise.reject(new Error('no listeners found'));
  }

  const event: IpcEvent = {
    sourceId: info.sourceId,
  };
  // renderer process
  if (item.rendererWebContents) {
    const promise = new Promise((resolve, reject) => {
      const id = createId();
      invokeCallbackMap.set(id, {
        webContent: item.rendererWebContents!,
        successCallback: resolve,
        errorCallback: reject,
      });
      const callbackParams: InvokeRenderInfo = {
        listenerId: item.listenerId,
        type: 'invoke',
        invokeId: id,
      };
      item.rendererWebContents!.send(MessageChannelEnum.MAIN_TO_RENDERER_CALLBACK, event, callbackParams, ...args);
    });
    return withTimeout(promise, info.opts?.timeout || 0);
  } else {
    // invoke main listener
    const promise = Promise.resolve().then(() => item.mainListener!(event, ...args));
    return withTimeout(promise, info.opts?.timeout || 0);
  }
}

export function addListenerInMain(info: { route: string; listenerId: number }, listener: Listener) {
  listenerList.push({
    route: info.route,
    listenerId: info.listenerId,
    mainListener: listener,
    webContentsId: MAIN_PROCESS_ID,
  });
}

export function removeListenerInMain(route: string, listener?: Listener) {
  if (listener) {
    // Remove the listener function according to route and listener
    const removed = remove(listenerList, item => listener === item.mainListener);
    removeWebContentsWhenNoListeners(removed);
    return;
  }
  // Remove all listener functions according to route
  const removed = remove(listenerList, item => route == item.route);
  removeWebContentsWhenNoListeners(removed);
}

export function removeListenerInRenderer(route: string, webContent: WebContents, ids?: number[]) {
  if (ids) {
    // Remove the listener function according to route and listener
    const removed = remove(
      listenerList,
      item => webContent === item.rendererWebContents && ids.includes(item.listenerId)
    );
    removeWebContentsWhenNoListeners(removed);
    return;
  }
  // Remove all listener functions according to route
  const removed = remove(listenerList, item => route == item.route);
  removeWebContentsWhenNoListeners(removed);
}

export function getAllListeners(route?: string): ListenerInfo[] {
  return listenerList
    .filter(item => (route ? item.route === route : true))
    .map(
      item =>
      ({
        route: item.route,
        webContentId: item.webContentsId,
      } as ListenerInfo)
    );
}

/**
 * Remove webContents when there are no listeners
 * @param removed removed listeners
 */
function removeWebContentsWhenNoListeners(removed: ListenerItem[]) {
  for (const item of removed) {
    // If it is a renderer process, judge whether there is a listener
    if (item.rendererWebContents) {
      const data = webContentsMap.get(item.rendererWebContents)?.data;
      if (data) {
        data.delete(item);
        // When there is no listener function in webContent, the close event should be unregistered and deleted from the map
        if (data.size === 0) {
          const removeListener = webContentsMap.get(item.rendererWebContents)!.removeListener;
          item.rendererWebContents.removeListener('destroyed', removeListener);
          item.rendererWebContents.removeListener('did-start-navigation', removeListener);
          webContentsMap.delete(item.rendererWebContents);
        }
      }
    }
  }
}
console.log('ipcMain', ipcMain)
ipcMain.on(MessageChannelEnum.RENDERER_TO_MAIN_OFF, (event, info: { ids?: number[]; route: string }) => {
  removeListenerInRenderer(info.route, event.sender, info.ids);
});
ipcMain.handle(MessageChannelEnum.RENDERER_TO_MAIN_GET_ALL_LISTENERS, (event, info: { route: string }) => {
  return getAllListeners(info.route);
});

ipcMain.on(
  MessageChannelEnum.RENDERER_TO_MAIN_BROADCAST,
  (event, info: { route: string; opts?: Options }, ...args: unknown[]) => {
    disposeBroadcast({ route: info.route, sourceId: event.sender.id, opts: info.opts }, ...args);
  }
);
ipcMain.handle(
  MessageChannelEnum.RENDERER_TO_MAIN_INVOKE,
  (event, info: { route: string; opts?: Options }, ...args: unknown[]) => {
    return disposeInvoke({ route: info.route, sourceId: event.sender.id, opts: info.opts }, ...args);
  }
);
ipcMain.on(MessageChannelEnum.RENDERER_TO_MAIN_ON, (event, info: { route: string; id: number }) => {
  const data: ListenerItem = {
    route: info.route,
    listenerId: info.id,
    rendererWebContents: event.sender,
    webContentsId: event.sender.id,
  };
  listenerList.push(data);
  if (webContentsMap.has(event.sender)) {
    webContentsMap.get(event.sender)!.data.add(data);
  } else {
    // Ensure that a webContent is only set once

    // When the webContents is destroyed or refreshed, all listeners should be reset
    const removeListener = () => {
      // Delete all listeners in the webContents
      const removed = remove(listenerList, item => item.rendererWebContents === event.sender);

      removeWebContentsWhenNoListeners(removed);
    };

    // If the webContent is not in the map, add it to the map
    const set = new Set<ListenerItem>();
    set.add(data);
    webContentsMap.set(event.sender, {
      data: set,
      removeListener: removeListener,
    });
    event.sender.once('destroyed', removeListener);
    event.sender.once('did-start-navigation', removeListener);
  }
});

ipcMain.on(MessageChannelEnum.RENDERER_TO_MAIN_REPLAY, (event, info: ReplayInfo) => {
  const item = invokeCallbackMap.get(info.invokeId);
  if (item) {
    invokeCallbackMap.delete(info.invokeId);
    if (info.isSuccess) {
      item.successCallback(info.data);
    } else {
      item.errorCallback(info.data as Error);
    }
  }
});
