import { ListenerInfo } from '../shared';
import { Listener, MessageCenterBase, Options } from '../shared/';
import {
  addListenerInMain,
  disposeBroadcast,
  disposeInvoke,
  getAllListeners,
  removeListenerInMain,
} from './mainProcess';

export class MessageCenter extends MessageCenterBase {
  public constructor(opts?: Options) {
    super(opts);
  }

  public broadcast(route: string, ...dataArgs: unknown[]): void {
    disposeBroadcast({ route }, ...dataArgs);
  }
  public invoke(route: string, ...dataArgs: unknown[]) {
    return disposeInvoke({ route }, ...dataArgs);
  }
  public on(route: string, listener: Listener): void {
    addListenerInMain(route, listener);
  }

  public off(route: string, listener?: Listener): void {
    removeListenerInMain(route, listener);
  }

  public getAllListeners(route?: string): Promise<ListenerInfo[]> {
    return Promise.resolve(getAllListeners(route));
  }
}
