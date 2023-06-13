import { ipcRenderer } from 'electron';
import { Listener, MessageCenterBase, Options, createId, remove } from '../shared/';
import { ListenerInfo, MessageChannelEnum } from '../shared';
import { listenerList } from './listenerManage';

export class MessageCenter extends MessageCenterBase {
  public constructor(opts?: Options) {
    super(opts);
  }
  public invoke(route: string, ...dataArgs: unknown[]) {
    return ipcRenderer.invoke(MessageChannelEnum.RENDERER_TO_MAIN_INVOKE, { route, opts: this.opts }, ...dataArgs);
  }
  public broadcast(route: string, ...dataArgs: unknown[]): void {
    ipcRenderer.send(MessageChannelEnum.RENDERER_TO_MAIN_BROADCAST, { route, opts: this.opts }, ...dataArgs);
  }

  public on(route: string, listener: Listener): void {
    const id = createId();
    listenerList.push({ id, route, listener });
    ipcRenderer.send(MessageChannelEnum.RENDERER_TO_MAIN_ON, { route, id });
  }

  public off(route: string, listener?: Listener): void {
    if (listener) {
      const removed = remove(listenerList, item => item.route === route && listener === item.listener);
      const ids = removed.map(item => item.id);
      ipcRenderer.send(MessageChannelEnum.RENDERER_TO_MAIN_OFF, { ids, route });
    } else {
      remove(listenerList, item => item.route === route);
      ipcRenderer.send(MessageChannelEnum.RENDERER_TO_MAIN_OFF, { route });
    }
  }

  public getAllListeners(route?: string): Promise<ListenerInfo[]> {
    return ipcRenderer.invoke(MessageChannelEnum.RENDERER_TO_MAIN_GET_ALL_LISTENERS, { route });
  }
}
