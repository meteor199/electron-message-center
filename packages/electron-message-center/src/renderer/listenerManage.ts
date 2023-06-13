import { ipcRenderer } from 'electron';
import { IpcEvent, Listener, ReplayInfo } from '../shared';
import { MessageChannelEnum, InvokeRenderInfo } from '../shared';

export const listenerList: { id: number; route: string; listener: Listener }[] = [];

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
