import { Listener, MessageCenterBase, Options } from '../shared/base';
import { addListenerInMain, disposeBroadcast, removeListenerInMain } from './mainProcess';

export class MessageCenter extends MessageCenterBase {
  public constructor(opts?: Options) {
    super(opts);
  }

  public broadcast(route: string, ...dataArgs: unknown[]): void {
    disposeBroadcast({ route }, ...dataArgs);
  }

  public on(route: string, listener: Listener): void {
    addListenerInMain(route, listener);
  }

  public off(route: string, listener?: Listener): void {
    removeListenerInMain(route, listener);
  }
}
