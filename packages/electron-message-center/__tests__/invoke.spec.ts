import { messageCenter as messageCenterRenderer, MessageCenter as MessageCenterRenderer } from '../src/renderer';
import { clearEnv, generateRoute, getWebContents, sleep } from './utils';
import '../src/main';
import { messageCenter as messageCenterMain, MessageCenter as MessageCenterMain } from '../src/main';
import { invokeCallbackList } from '../src/main/mainProcess';
import { IpcEvent, MAIN_PROCESS_ID } from '../src/shared';

describe('invoke test', () => {
  let route: string;

  beforeEach(() => {
    route = generateRoute();
  });

  afterEach(() => {
    clearEnv();
  });

  describe('basic', () => {
    it('After a successful invoke, the length of invokeCallbackList should be 0', async () => {
      function first(event: IpcEvent, num: number) {
        return num + 1;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      await messageCenterMain.invoke(route, 1);

      expect(invokeCallbackList.length).toBe(0);
    });

    it('when there is no listener, it should return an error', async () => {
      try {
        await messageCenterMain.invoke(route, 1);
        expect.fail('There should be an error when there is no listener');
      } catch (err) {
        expect((err as Error).message).toBe('no listeners found');
      }
    });
    it('when there are multiple listeners, it should return the first one', async () => {
      messageCenterRenderer.on(route, () => 1);
      await sleep(1);
      messageCenterRenderer.on(route, () => 2);
      await sleep(1);
      messageCenterMain.on(route, () => 3);

      const ret = await messageCenterMain.invoke(route);
      expect(ret).toBe(1);
    });
  });

  describe('main process invokes renderer process', () => {
    it('if there are multiple arguments, they should be received correctly', async () => {
      function first(event: IpcEvent, ...args: unknown[]) {
        expect(route).toBe(route);
        expect(args[0]).to.equal(1);
        expect(args[1]).to.equal(null);
        expect(args[2]).to.equal('x');
        expect(args[3]).toMatchObject({ a: 1 });
        return 2;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1, null, 'x', { a: 1 }, new Error('test'));
      expect(ret).toBe(2);
    });
    it('event should be received correctly', async () => {
      function first(event: IpcEvent) {
        expect(event.sourceId).toBe(MAIN_PROCESS_ID);
        return 2;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route);
      expect(ret).toBe(2);
    });
    it('when returning a normal type, the return value should be received', async () => {
      function first(event: IpcEvent, num: number) {
        return num + 1;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1);
      expect(ret).toBe(2);
    });

    it('when returning a Promise type, the return value should be received', async () => {
      async function first(event: IpcEvent, num: number) {
        await sleep(1);
        return num + 2;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1);
      expect(ret).toBe(3);
    });

    it('when an exception is thrown, the error should be received', async () => {
      function first() {
        throw new Error('error test');
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      try {
        await messageCenterMain.invoke(route, 1);
        expect.fail('should not return normally');
      } catch (err) {
        expect((err as Error).message).toBe('error test');
      }
    });
    it('when returning an asynchronous error (Promise.reject), the error should be received', async () => {
      function first() {
        return Promise.reject(new Error('error promise test'));
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      try {
        await messageCenterMain.invoke(route, 1);
        expect.fail('should not return normally');
      } catch (err) {
        expect((err as Error).message).toBe('error promise test');
      }
    });
    it('when the listener has no return value, undefined should be received', async () => {
      function first() {
        //
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1);
      expect(ret).toBe(undefined);
    });

    it('invoke with specified WebContents should be successful', async () => {
      messageCenterRenderer.on(route, () => 1);
      await sleep(1);
      messageCenterMain.on(route, () => 2);

      const specifiedInvoke = new MessageCenterMain({ webContentsId: MAIN_PROCESS_ID });

      const ret = await specifiedInvoke.invoke(route, 1);
      expect(ret).toBe(2);
    });

    it('invoke with multiple WebContents should be successful', async () => {
      messageCenterRenderer.on(route, () => 1);
      await sleep(1);
      messageCenterMain.on(route, () => 2);

      const specifiedInvoke = new MessageCenterMain({ webContentsId: [MAIN_PROCESS_ID, getWebContents().id] });

      const ret = await specifiedInvoke.invoke(route, 1);
      expect(ret).toBe(1);
    });

    it('should return error when timeout', async () => {
      async function first() {
        //
        await sleep(100);
        return 1;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const specified = new MessageCenterMain({ timeout: 10 });
      try {
        await specified.invoke(route, 1);
        expect.fail('fail');
      } catch (e) {
        expect((e as Error).message).toBe('timeout');
      }
    });
    it('should return success when not timeout', async () => {
      async function first() {
        await sleep(10);
        return 1;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const specified = new MessageCenterMain({ timeout: 20 });
      const ret = await specified.invoke(route, 1);
      expect(ret).toBe(1);
    });
  });

  describe('main process invokes main process', () => {
    it('if there are multiple arguments, they should be received correctly', async () => {
      function first(event: IpcEvent, ...args: unknown[]) {
        expect(route).toBe(route);
        expect(args[0]).to.equal(1);
        expect(args[1]).to.equal(null);
        expect(args[2]).to.equal('x');
        expect(args[3]).toMatchObject({ a: 1 });
        return 2;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1, null, 'x', { a: 1 }, new Error('test'));
      expect(ret).toBe(2);
    });

    it('event should be received correctly', async () => {
      function first(event: IpcEvent) {
        expect(event.sourceId).toBe(MAIN_PROCESS_ID);
        return 2;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route);
      expect(ret).toBe(2);
    });
    it('when returning a normal type, the return value should be received', async () => {
      function first(event: IpcEvent, num: number) {
        return num + 1;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1);
      expect(ret).toBe(2);
    });

    it('when returning a Promise type, the return value should be received', async () => {
      async function first(event: IpcEvent, num: number) {
        await sleep(1);
        return num + 2;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1);
      expect(ret).toBe(3);
    });
    it('when an exception is thrown, the error should be received', async () => {
      function first() {
        throw new Error('error test');
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      try {
        await messageCenterMain.invoke(route, 1);
        expect.fail('should not return normally');
      } catch (err) {
        expect((err as Error).message).toBe('error test');
      }
    });
    it('when returning an asynchronous error (Promise.reject), the error should be received', async () => {
      function first() {
        return Promise.reject(new Error('error promise test'));
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      try {
        await messageCenterMain.invoke(route, 1);
        expect.fail('should not return normally');
      } catch (err) {
        expect((err as Error).message).toBe('error promise test');
      }
    });

    it('when the listener has no return value, undefined should be received', async () => {
      function first() {
        //
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1);
      expect(ret).toBe(undefined);
    });

    it('should return error when timeout', async () => {
      async function first() {
        //
        await sleep(100);
        return 1;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const specified = new MessageCenterMain({ timeout: 10 });
      try {
        await specified.invoke(route, 1);
        expect.fail('fail');
      } catch (e) {
        expect((e as Error).message).toBe('timeout');
      }
    });
    it('should return success when not timeout', async () => {
      async function first() {
        //
        await sleep(10);
        return 1;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const specified = new MessageCenterMain({ timeout: 20 });

      const ret = await specified.invoke(route, 1);
      expect(ret).toBe(1);
    });
  });

  describe('renderer process invokes main process', () => {
    it('if there are multiple arguments, they should be received correctly', async () => {
      function first(event: IpcEvent, ...args: unknown[]) {
        expect(route).toBe(route);
        expect(args[0]).to.equal(1);
        expect(args[1]).to.equal(null);
        expect(args[2]).to.equal('x');
        expect(args[3]).toMatchObject({ a: 1 });
        return 2;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterRenderer.invoke(route, 1, null, 'x', { a: 1 }, new Error('test'));
      expect(ret).toBe(2);
    });

    it('event should be received correctly', async () => {
      function first(event: IpcEvent) {
        expect(event.sourceId).toBe((globalThis as any).webConents.id);
        return 2;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterRenderer.invoke(route);
      expect(ret).toBe(2);
    });
    it('when returning a normal type, the return value should be received', async () => {
      function first(event: IpcEvent, num: number) {
        return num + 1;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterRenderer.invoke(route, 1);
      expect(ret).toBe(2);
    });

    it('when returning a Promise type, the return value should be received', async () => {
      async function first(event: IpcEvent, num: number) {
        await sleep(1);
        return num + 2;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterRenderer.invoke(route, 1);
      expect(ret).toBe(3);
    });

    it('when an exception is thrown, the error should be received', async () => {
      function first() {
        throw new Error('error test');
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      try {
        await messageCenterRenderer.invoke(route, 1);
        expect.fail('should not return normally');
      } catch (err) {
        expect((err as Error).message).toBe('error test');
      }
    });
    it('when returning an asynchronous error (Promise.reject), the error should be received', async () => {
      function first() {
        return Promise.reject(new Error('error promise test'));
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      try {
        await messageCenterRenderer.invoke(route, 1);
        expect.fail('should not return normally');
      } catch (err) {
        expect((err as Error).message).toBe('error promise test');
      }
    });

    it('when the listener has no return value, undefined should be received', async () => {
      function first() {
        //
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterRenderer.invoke(route, 1);
      expect(ret).toBe(undefined);
    });

    it('should return error when timeout', async () => {
      async function first() {
        //
        await sleep(100);
        return 1;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const specified = new MessageCenterRenderer({ timeout: 10 });
      try {
        await specified.invoke(route, 1);
        expect.fail('fail');
      } catch (e) {
        expect((e as Error).message).toBe('timeout');
      }
    });
    it('should return success when not timeout', async () => {
      async function first() {
        //
        await sleep(10);
        return 1;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const specified = new MessageCenterRenderer({ timeout: 20 });

      const ret = await specified.invoke(route, 1);
      expect(ret).toBe(1);
    });
  });

  describe('renderer process invokes renderer process', () => {
    it('if there are multiple arguments, they should be received correctly', async () => {
      function first(event: IpcEvent, ...args: unknown[]) {
        expect(route).toBe(route);
        expect(args[0]).to.equal(1);
        expect(args[1]).to.equal(null);
        expect(args[2]).to.equal('x');
        expect(args[3]).toMatchObject({ a: 1 });
        return 2;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const ret = await messageCenterRenderer.invoke(route, 1, null, 'x', { a: 1 }, new Error('test'));
      expect(ret).toBe(2);
    });

    it('when returning a normal type, the return value should be received', async () => {
      function first(event: IpcEvent, num: number) {
        return num + 1;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const ret = await messageCenterRenderer.invoke(route, 1);
      expect(ret).toBe(2);
    });

    it('when returning a Promise type, the return value should be received', async () => {
      async function first(event: IpcEvent, num: number) {
        await sleep(1);
        return num + 2;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const ret = await messageCenterRenderer.invoke(route, 1);
      expect(ret).toBe(3);
    });

    it('when an exception is thrown, the error should be received', async () => {
      function first() {
        throw new Error('error test');
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      try {
        await messageCenterRenderer.invoke(route, 1);
        expect.fail('should not return normally');
      } catch (err) {
        expect((err as Error).message).toBe('error test');
      }
    });
    it('when returning an asynchronous error (Promise.reject), the error should be received', async () => {
      function first() {
        return Promise.reject(new Error('error promise test'));
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      try {
        await messageCenterRenderer.invoke(route, 1);
        expect.fail('should not return normally');
      } catch (err) {
        expect((err as Error).message).toBe('error promise test');
      }
    });

    it('when the listener has no return value, undefined should be received', async () => {
      function first() {
        //
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const ret = await messageCenterRenderer.invoke(route, 1);
      expect(ret).toBe(undefined);
    });

    it('invoke with specified WebContents should be successful', async () => {
      messageCenterRenderer.on(route, () => 1);
      await sleep(1);
      messageCenterMain.on(route, () => 2);

      const specifiedInvoke = new MessageCenterRenderer({ webContentsId: MAIN_PROCESS_ID });

      const ret = await specifiedInvoke.invoke(route, 1);
      expect(ret).toBe(2);
    });

    it('invoke with multiple WebContents should be successful', async () => {
      messageCenterRenderer.on(route, () => 1);
      await sleep(1);
      messageCenterMain.on(route, () => 2);

      const specifiedInvoke = new MessageCenterRenderer({ webContentsId: [MAIN_PROCESS_ID, getWebContents().id] });

      const ret = await specifiedInvoke.invoke(route, 1);
      expect(ret).toBe(1);
    });

    it('should return error when timeout', async () => {
      async function first() {
        //
        await sleep(100);
        return 1;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const specified = new MessageCenterRenderer({ timeout: 10 });

      try {
        await specified.invoke(route, 1);
      } catch (e) {
        expect((e as Error).message).toBe('timeout');
        return;
      }
      expect.fail('fail');
    });
    // it('should return success when not timeout', async () => {
    //   async function first() {
    //     //
    //     await sleep(1);
    //     return 1;
    //   }
    //   messageCenterRenderer.on(route, first);
    //   await sleep(1);
    //   const specified = new MessageCenterRenderer({ timeout: 1000 });

    //   const ret = await specified.invoke(route, 1);
    //   expect(ret).toBe(1);
    // });
  });
});
