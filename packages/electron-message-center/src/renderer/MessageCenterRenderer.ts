import { ipcRenderer } from 'electron';
import { IpcEvent, Listener, MessageCenterBase, Options, ReplayInfo, createId } from '../shared/';
import { ListenerInfo, MessageChannelEnum, InvokeRenderInfo } from '../shared';

let listenerList: { id: number; route: string; listener: Listener }[] = [];

ipcRenderer.on(
  MessageChannelEnum.MAIN_TO_RENDERER_CALLBACK,
  async (e, event: IpcEvent, info: InvokeRenderInfo, ...args: unknown[]) => {
    const item = listenerList.find(r => r.id === info.listenerId);

    if (!item) return;

    if (info.type === 'invoke') {
      try {
        const data = await item.listener(event, ...args);
        ipcRenderer.send(MessageChannelEnum.RENDERER_TO_MAIN_REPLAY, {
          invokeId: info.invokeId,
          data: data,
          isSuccess: true,
        } as ReplayInfo);
      } catch (e) {
        ipcRenderer.send(MessageChannelEnum.RENDERER_TO_MAIN_REPLAY, {
          invokeId: info.invokeId,
          data: e,
          isSuccess: false,
        } as ReplayInfo);
      }
    } else {
      item.listener(event, ...args);
    }
  }
);

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
    const ids: number[] = [];
    if (listener) {
      listenerList = listenerList.filter(item => {
        if (item.route === route && listener === item.listener) {
          ids.push(item.id);
          return false;
        }
        return true;
      });
      ipcRenderer.send(MessageChannelEnum.RENDERER_TO_MAIN_OFF, { ids, route });
    } else {
      listenerList = listenerList.filter(item => item.route !== route);
      ipcRenderer.send(MessageChannelEnum.RENDERER_TO_MAIN_OFF, { route });
    }
  }

  public getAllListeners(route?: string): Promise<ListenerInfo[]> {
    return ipcRenderer.invoke(MessageChannelEnum.RENDERER_TO_MAIN_GET_ALL_LISTENERS, { route });
  }
}
