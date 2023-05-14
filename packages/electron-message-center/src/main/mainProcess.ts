import { ipcMain, WebContents } from 'electron'; // eslint-disable-line
import { ListenerInfo, MessageChannelEnum, Listener } from '../shared';

let listenerMap: {
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
   * main process listener callback
   */
  mainListener?: Listener;
}[] = [];

/**
 * dispose broadcast
 * @param info message info
 * @param args arguments
 */
export function disposeBroadcast(info: { route: string }, ...args: unknown[]) {
  const filteredListeners = listenerMap.filter(item => item.route === info.route);
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
  listenerMap.push({
    route: route,
    type: 'main',
    mainListener: listener,
  });
}

export function removeListenerInMain(route: string, listener?: Listener) {
  if (!listener) {
    listenerMap = listenerMap.filter(item => item.route !== route);
  } else {
    listenerMap = listenerMap.filter(item => !(item.route === route && item.mainListener === listener));
  }
}

export function getAllListeners(route?: string): ListenerInfo[] {
  return listenerMap
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
  listenerMap.push({
    route: info.route,
    rendererListenerId: info.id,
    rendererWebContents: event.sender,
    type: 'renderer',
  });

  event.sender.once('destroyed', () => {
    listenerMap = listenerMap.filter(item => item.rendererWebContents !== event.sender);
  });

  event.sender.once('did-start-navigation', () => {
    listenerMap = listenerMap.filter(item => item.rendererWebContents !== event.sender);
  });
});

ipcMain.on(MessageChannelEnum.RENDERER_TO_MAIN_OFF, (event, info: { ids?: number[]; route?: string }) => {
  if (info.route) {
    listenerMap = listenerMap.filter(item => info.route !== item.route);
  } else if (info.ids) {
    listenerMap = listenerMap.filter(item => {
      if (event.sender === item.rendererWebContents && info.ids.includes(item.rendererListenerId)) {
        return false;
      }
      return true;
    });
  }
});
ipcMain.handle(MessageChannelEnum.RENDERER_TO_MAIN_GET_ALL_LISTENERS, (event, info: { route: string }) => {
  return getAllListeners(info.route);
});
