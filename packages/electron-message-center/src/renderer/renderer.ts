import { ipcRenderer } from 'electron'; // eslint-disable-line
import { Listener, MessageCenterBase, Options, createId } from '../shared/base';
import { MessageChannelEnum } from '../shared';

let listenerMap: { id: number; route: string; listener: Listener }[] = [];

ipcRenderer.on(MessageChannelEnum.MAIN_TO_RENDERER_BROADCAST, (event, info: { id: number }, ...args: any[]) => {
  listenerMap.forEach(item => {
    if (item.id === info.id) {
      item.listener(...args);
    }
  });
});

export class MessageCenter extends MessageCenterBase {
  public constructor(opts?: Options) {
    super(opts);
  }

  public broadcast(route: string, ...dataArgs: unknown[]): void {
    ipcRenderer.send(MessageChannelEnum.RENDERER_TO_MAIN_BROADCAST, { route }, ...dataArgs);
  }

  public on(route: string, listener: Listener): void {
    const id = createId();
    listenerMap.push({ id, route, listener });
    ipcRenderer.send(MessageChannelEnum.RENDERER_TO_MAIN_ON, { route, id });
  }

  public off(route: string, listener?: Listener): void {
    const ids: number[] = [];
    listenerMap = listenerMap.filter(item => {
      if (item.route === route && (listener === undefined || listener === item.listener)) {
        ids.push(item.id);
        return false;
      }
      return true;
    });
    ipcRenderer.send(MessageChannelEnum.RENDERER_TO_MAIN_OFF, { ids });
  }
}

export const messageCenter = new MessageCenter();
