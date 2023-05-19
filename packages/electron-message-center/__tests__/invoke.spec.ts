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
    it('主进程invoke后， invokeCallbackList 长度应该为0', async () => {
      function first(num: number) {
        return num + 1;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      await messageCenterMain.invoke(route, 1);

      expect(invokeCallbackList.length).toBe(0);
    });
  });

  describe('主进程 invoke 渲染进程', () => {
    it('主进程invoke渲染进程，当渲染进程有监听者并且监听者返回普通类型时，应该正确返回给主进程', async () => {
      function first(num: number) {
        return num + 1;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1);
      expect(ret).toBe(2);
    });

    it('主进程invoke渲染进程，当渲染进程有监听者时，假如有多个参数，参数应该都正确接收', async () => {
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

    it('主进程invoke渲染进程，当渲染进程有监听者并且监听者返回Promise类型时，应该正确返回给主进程', async () => {
      async function first(num: number) {
        await sleep(1);
        return num + 2;
      }
      messageCenterRenderer.on(route, first);
      await sleep(1);
      const ret = await messageCenterMain.invoke(route, 1);
      expect(ret).toBe(3);
    });

    it('主进程invoke渲染进程，当渲染进程抛出异常时，主进程应接收到错误', async () => {
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
    it('主进程invoke渲染进程，当渲染进程是Promise，并且reject时，主进程应接收到错误', async () => {
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
  });
});
