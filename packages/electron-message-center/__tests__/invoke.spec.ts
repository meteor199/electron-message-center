import { messageCenter as messageCenterRenderer } from '../src/renderer';
import { clearEnv, generateRoute, sleep } from './utils';
import '../src/main';
import { messageCenter as messageCenterMain } from '../src/main';
import { invokeCallbackList } from '../src/main/mainProcess';

describe('invoke test', () => {
  let route: string;

  beforeEach(() => {
    route = generateRoute();
  });

  afterEach(() => {
    clearEnv();
  });

  describe('basic', () => {
    it('invoke成功后， invokeCallbackList 长度应该为0', async () => {
      function first(num: number) {
        return num + 1;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      await messageCenterMain.invoke(route, 1);

      expect(invokeCallbackList.length).toBe(0);
    });

    it('当没有linstener时， 应返回错误', async () => {
      try {
        await messageCenterMain.invoke(route, 1);
        expect.fail('没有监听者，应该报错');
      } catch (err) {
        expect((err as Error).message).toBe('no listeners found');
      }
    });
    it('当有多个linstener时， 应返回第一个', async () => {
      messageCenterRenderer.on(route, () => 1);
      await sleep(1);
      messageCenterRenderer.on(route, () => 2);
      await sleep(1);
      messageCenterMain.on(route, () => 3);

      const ret = await messageCenterMain.invoke(route);
      expect(ret).toBe(1);
    });
  });

  describe('主进程 invoke 渲染进程', () => {
    it('假如有多个参数，参数应该都正确接收', async () => {
      function first(...args: unknown[]) {
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

    it('当返回普通类型时，应收到返回值', async () => {
      function first(num: number) {
        return num + 1;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1);
      expect(ret).toBe(2);
    });

    it('当返回Promise类型时，应收到返回值', async () => {
      async function first(num: number) {
        await sleep(1);
        return num + 2;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1);
      expect(ret).toBe(3);
    });

    it('当抛出异常时，应接收到错误', async () => {
      function first() {
        throw new Error('error test');
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      try {
        await messageCenterMain.invoke(route, 1);
        expect.fail('不应该正常返回');
      } catch (err) {
        expect((err as Error).message).toBe('error test');
      }
    });
    it('当是返回异步错误时(Promise.reject)，应接收到错误', async () => {
      function first() {
        return Promise.reject(new Error('error promise test'));
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      try {
        await messageCenterMain.invoke(route, 1);
        expect.fail('不应该正常返回');
      } catch (err) {
        expect((err as Error).message).toBe('error promise test');
      }
    });
    it('当是监听者没有返回值时，应接收到undefined', async () => {
      function first() {
        //
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1);
      expect(ret).toBe(undefined);
    });
  });

  describe('主进程 invoke 主进程', () => {
    it('假如有多个参数，参数应该都正确接收', async () => {
      function first(...args: unknown[]) {
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

    it('当返回普通类型时，应收到返回值', async () => {
      function first(num: number) {
        return num + 1;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1);
      expect(ret).toBe(2);
    });

    it('当返回Promise类型时，应收到返回值', async () => {
      async function first(num: number) {
        await sleep(1);
        return num + 2;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1);
      expect(ret).toBe(3);
    });

    it('当抛出异常时，应接收到错误', async () => {
      function first() {
        throw new Error('error test');
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      try {
        await messageCenterMain.invoke(route, 1);
        expect.fail('不应该正常返回');
      } catch (err) {
        expect((err as Error).message).toBe('error test');
      }
    });
    it('当是返回异步错误时(Promise.reject)，应接收到错误', async () => {
      function first() {
        return Promise.reject(new Error('error promise test'));
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      try {
        await messageCenterMain.invoke(route, 1);
        expect.fail('不应该正常返回');
      } catch (err) {
        expect((err as Error).message).toBe('error promise test');
      }
    });

    it('当是监听者没有返回值时，应接收到undefined', async () => {
      function first() {
        //
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1);
      expect(ret).toBe(undefined);
    });
  });

  describe('渲染进程 invoke 主进程', () => {
    it('假如有多个参数，参数应该都正确接收', async () => {
      function first(...args: unknown[]) {
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

    it('当返回普通类型时，应收到返回值', async () => {
      function first(num: number) {
        return num + 1;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterRenderer.invoke(route, 1);
      expect(ret).toBe(2);
    });

    it('当返回Promise类型时，应收到返回值', async () => {
      async function first(num: number) {
        await sleep(1);
        return num + 2;
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterRenderer.invoke(route, 1);
      expect(ret).toBe(3);
    });

    it('当抛出异常时，应接收到错误', async () => {
      function first() {
        throw new Error('error test');
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      try {
        await messageCenterRenderer.invoke(route, 1);
        expect.fail('不应该正常返回');
      } catch (err) {
        expect((err as Error).message).toBe('error test');
      }
    });
    it('当是返回异步错误时(Promise.reject)，应接收到错误', async () => {
      function first() {
        return Promise.reject(new Error('error promise test'));
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      try {
        await messageCenterRenderer.invoke(route, 1);
        expect.fail('不应该正常返回');
      } catch (err) {
        expect((err as Error).message).toBe('error promise test');
      }
    });

    it('当是监听者没有返回值时，应接收到undefined', async () => {
      function first() {
        //
      }
      messageCenterMain.on(route, first);
      await sleep(1);
      const ret = await messageCenterRenderer.invoke(route, 1);
      expect(ret).toBe(undefined);
    });
  });
});
