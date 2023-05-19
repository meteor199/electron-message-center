import { ipcMain, webContents, WebContents } from 'electron'; // eslint-disable-line
import { ListenerInfo, MessageChannelEnum, Listener, remove, CallbackInfo, ReplayInfo } from '../shared';

interface ListenerItem {
  type: 'renderer' | 'main';
  /**
   * message channel
   */
  route: string;

  /**
   * renderer callback function's id
   */
  rendererListenerId?: number;
  /**
   * sender renderer
   */
  rendererWebContents?: WebContents;

  /**
   * main process listener
   */
  mainListener?: Listener;
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
 * dispose broadcast
 * @param info message info
 * @param args arguments
 */
export function disposeBroadcast(info: { route: string }, ...args: unknown[]) {
  const filteredListeners = listenerList.filter(item => item.route === info.route);

  filteredListeners.forEach(item => {
    const callbackParams: CallbackInfo = {
      id: item.rendererListenerId,
      type: 'boardcast',
    };
    if (item.type === 'renderer') {
      item.rendererWebContents.send(MessageChannelEnum.MAIN_TO_RENDERER_CALLBACK, callbackParams, ...args);
    } else {
      item.mainListener(...args);
    }
  });
}

/**
 * dispose broadcast
 * @param info message info
 * @param args arguments
 */
export function disposeInvoke(info: { route: string }, ...args: unknown[]) {
  return new Promise((resolve, reject) => {
    const item = listenerList.find(item => item.route === info.route);

    if (item) {
      if (item.type === 'renderer') {
        const id = invokeId++;
        invokeCallbackList.push({
          webContent: item.rendererWebContents,
          successCallback: resolve,
          errorCallback: reject,
          invokeId: id,
        });
        const callbackParams: CallbackInfo = {
          id: item.rendererListenerId,
          type: 'invoke',
          invokeId: id,
        };
        item.rendererWebContents.send(MessageChannelEnum.MAIN_TO_RENDERER_CALLBACK, callbackParams, ...args);
      }
    }
  });
}

let invokeId = 0;
export const invokeCallbackList: {
  invokeId: number;
  webContent: WebContents;
  successCallback: Listener;
  errorCallback: (err: Error) => void;
}[] = [];

ipcMain.on(MessageChannelEnum.RENDERER_TO_MAIN_REPLAY, (event, info: ReplayInfo) => {
  const [item] = remove(invokeCallbackList, item => item.invokeId === info.invokeId);
  if (item) {
    if (info.successData) {
      item.successCallback(info.successData);
    } else {
      item.errorCallback(info.errorMsg);
    }
  }
});

export function addListenerInMain(route: string, listener: Listener) {
  listenerList.push({
    route: route,
    type: 'main',
    mainListener: listener,
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
      item => webContent === item.rendererWebContents && ids.includes(item.rendererListenerId)
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
    .map(item => ({
      route: item.route,
      webContentId: item.rendererWebContents?.id,
      type: item.type,
    }));
}

ipcMain.on(MessageChannelEnum.RENDERER_TO_MAIN_BROADCAST, (event, info: { route: string }, ...args: unknown[]) => {
  disposeBroadcast(info, ...args);
});

ipcMain.on(MessageChannelEnum.RENDERER_TO_MAIN_ON, (event, info: { route: string; id: number }) => {
  const data: ListenerItem = {
    route: info.route,
    rendererListenerId: info.id,
    rendererWebContents: event.sender,
    type: 'renderer',
  };
  listenerList.push(data);
  if (webContentsMap.has(event.sender)) {
    webContentsMap.get(event.sender).data.add(data);
  } else {
    // Ensure that a webContent is only set once
    const removeListener = () => {
      const removed = remove(listenerList, item => item.rendererWebContents === event.sender);
      removeWebContentsWhenNoListeners(removed);
    };
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
          const removeListener = webContentsMap.get(item.rendererWebContents).removeListener;
          item.rendererWebContents.removeListener('destroyed', removeListener);
          item.rendererWebContents.removeListener('did-start-navigation', removeListener);
          webContentsMap.delete(item.rendererWebContents);
        }
      }
    }
  }
}

ipcMain.on(MessageChannelEnum.RENDERER_TO_MAIN_OFF, (event, info: { ids?: number[]; route: string }) => {
  removeListenerInRenderer(info.route, event.sender, info.ids);
});
ipcMain.handle(MessageChannelEnum.RENDERER_TO_MAIN_GET_ALL_LISTENERS, (event, info: { route: string }) => {
  return getAllListeners(info.route);
});
