import { Listener, ListenerInfo } from './types';

export abstract class MessageCenterBase {
  public constructor(opts: { maxTimeoutMs?: number } | undefined) {
    //
  }

  /**
   * Send a message to all listeners in the main process or renderers via `route`.
   * @param {string} route - The route to send the message to.
   * @param {...any} args - The arguments to send with the message.
   */
  public abstract broadcast(route: string, ...dataArgs: unknown[]): void;
  public abstract on(route: string, listener: Listener): void;
  public abstract off(route: string, listener?: Listener): void;
  public abstract getAllListeners(route?: string): Promise<ListenerInfo[]>;
  /**
   * Send a message to the main process or renderers via `route` and expect a result asynchronously.
   * @param {string} route - The route to send the message to.
   * @param {...any} args - The arguments to send with the message.
   * @returns {Promise<any>} - A promise that resolves with the result of the message.
   */
  public abstract invoke(route: string, ...dataArgs: unknown[]): Promise<unknown>;
}
