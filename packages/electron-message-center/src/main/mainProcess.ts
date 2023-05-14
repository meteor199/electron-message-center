import { ipcMain, WebContents } from 'electron'; // eslint-disable-line
import { MessageChannelEnum } from '../shared';
import { Listener } from '../shared/base';

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
  listenerMap.forEach(item => {
    if (item.route === info.route) {
      if (item.type === 'renderer') {
        item.rendererWebContents.send(
          MessageChannelEnum.MAIN_TO_RENDERER_BROADCAST,
          { id: item.rendererListenerId },
          ...args
        );
      } else {
        item.mainListener(...args);
      }
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
  listenerMap = listenerMap.filter(item => {
    if (!listener) {
      return item.route !== route;
    }
    if (item.route === route && item.mainListener === listener) {
      return false;
    }
    return true;
  });
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

ipcMain.on(MessageChannelEnum.RENDERER_TO_MAIN_OFF, (event, info: { ids: number[] }) => {
  listenerMap = listenerMap.filter(item => !info.ids.includes(item.rendererListenerId));
});
