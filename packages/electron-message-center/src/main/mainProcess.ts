import { ipcMain, webContents, WebContents } from 'electron'; // eslint-disable-line
import { ListenerInfo, MessageChannelEnum, Listener, remove } from '../shared';

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

let listenerList: ListenerItem[] = [];

/**
 * 记录监听关闭事件的webcontents。当此webcontents无任何监听时，应该删除关闭事件监听。
 */
const webContentsMap = new WeakMap<
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
    if (item.type === 'renderer') {
      item.rendererWebContents.send(
        MessageChannelEnum.MAIN_TO_RENDERER_BROADCAST,
        { id: item.rendererListenerId },
        ...args
      );
    } else {
      item.mainListener(...args);
    }
  });
}

export function addListenerInMain(route: string, listener: Listener) {
  listenerList.push({
    route: route,
    type: 'main',
    mainListener: listener,
  });
}

export function removeListenerInMain(route: string, listener?: Listener) {
  if (listener) {
    // 根据 route和listener 删除监听函数
    const removed = remove(listenerList, item => listener === item.mainListener);
    removeWebContentsWhenNoListeners(removed);
    return;
  }
  // 根据 route 删除所有监听函数
  const removed = remove(listenerList, item => route == item.route);
  removeWebContentsWhenNoListeners(removed);
}

export function removeListenerInRenderer(route: string, webContent: WebContents, ids?: number[]) {
  if (ids) {
    // 根据 route和listener 删除监听函数
    const removed = remove(
      listenerList,
      item => webContent === item.rendererWebContents && ids.includes(item.rendererListenerId)
    );
    removeWebContentsWhenNoListeners(removed);
    return;
  }
  // 根据 route 删除所有监听函数
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
    // 确保一个webContent只设置一次
    const removeListener = () => {
      listenerList = listenerList.filter(item => item.rendererWebContents !== event.sender);
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

function removeWebContentsWhenNoListeners(removed: ListenerItem[]) {
  for (const item of removed) {
    // 是渲染进程， 并且渲染进程
    if (item.rendererWebContents) {
      const data = webContentsMap.get(item.rendererWebContents)?.data;
      if (data) {
        data.delete(item);
        // 当webContent中不存在时，则删除webContents
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
