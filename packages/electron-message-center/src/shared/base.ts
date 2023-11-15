import { Listener, ListenerInfo, Options } from './types';

export abstract class MessageCenterBase {
  public constructor(protected opts?: Options) {
    //
  }

  /**
   * Send a message to all listeners in the main process or renderers via `route`.
   * @param {string} route - The route to send the message to.
   * @param {...any} args - The arguments to send with the message.
   */
  public abstract broadcast(route: string, ...dataArgs: unknown[]): void;
  /**
   * Register a listener for a specific channel.
   * @param {string} route - The route to send the message to.
   * @param {Listener} listener - The listener to register.
   */
  public abstract on(route: string, listener: Listener): void;
  /**
   * Unregister a listener for a specific channel.
   * @param {string} route - The route to remove the listener from.
   * @param {Listener} [listener] - The listener to unregister. If not provided, all listeners for the specified route will be removed.
   */
  public abstract off(route: string, listener?: Listener): void;

  /**
   * Retrieve all registered listeners for a specific channel or all channels.
   * @param {string} [route] - The route to get listeners for. If not provided, returns all listeners for all routes.
   * @returns {Promise<ListenerInfo[]>} - A promise that resolves with an array of ListenerInfo objects.
   */
  public abstract getAllListeners(route?: string): Promise<ListenerInfo[]>;
  /**
   * Send a message to the main process or renderers via `route` and expect a result asynchronously.
   * @param {string} route - The route to send the message to.
   * @param {...any} args - The arguments to send with the message.
   * @returns {Promise<any>} - A promise that resolves with the result of the message.
   */
  public abstract invoke(route: string, ...dataArgs: unknown[]): Promise<unknown>;
}
