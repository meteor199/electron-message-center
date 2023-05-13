import { ipcMain, WebContents } from 'electron'; // eslint-disable-line
import { MessageChannelEnum } from '../shared';

let listenerMap: {
  /**
   * renderer callback function's id
   */
  id: number;
  /**
   * message channel
   */
  route: string;
  /**
   * sender renderer
   */
  webContents: WebContents;
}[] = [];

ipcMain.on(MessageChannelEnum.RENDERER_TO_MAIN_BROADCAST, (event, info: { route: string }, ...args: unknown[]) => {
  listenerMap.forEach(item => {
    if (item.route === info.route) {
      item.webContents.send(MessageChannelEnum.MAIN_TO_RENDERER_BROADCAST, { id: item.id }, ...args);
    }
  });
});

ipcMain.on(MessageChannelEnum.RENDERER_TO_MAIN_ON, (event, info: { route: string; id: number }) => {
  listenerMap.push({
    route: info.route,
    id: info.id,
    webContents: event.sender,
  });

  event.sender.once('destroyed', () => {
    listenerMap = listenerMap.filter(item => item.webContents !== event.sender);
  });

  event.sender.once('did-start-navigation', () => {
    listenerMap = listenerMap.filter(item => item.webContents !== event.sender);
  });
});

ipcMain.on(MessageChannelEnum.RENDERER_TO_MAIN_OFF, (event, info: { ids: number[] }) => {
  listenerMap = listenerMap.filter(item => !info.ids.includes(item.id));
});
