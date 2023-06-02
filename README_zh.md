# electron-message-center

一个易于使用的 npm 包，用于简化 Electron 应用程序中的进程间通信。支持跨窗口通信和其他高级消息功能。

[![publish](https://github.com/meteor199/electron-message-center/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/meteor199/electron-message-center/actions/workflows/npm-publish.yml)
[![ci](https://github.com/meteor199/electron-message-center/actions/workflows/ci.yml/badge.svg)](https://github.com/meteor199/electron-message-center/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/electron-message-center.svg)](https://badge.fury.io/js/electron-message-center)
[![codecov](https://codecov.io/gh/meteor199/electron-message-center/branch/main/graph/badge.svg)](https://codecov.io/gh/meteor199/electron-message-center)

## 安装

首先，您需要从 NPM 安装它：

```sh
npm install --save electron-message-center
```

其次，必须在主进程中初始化 electron-message-center：

```js
require('electron-message-center/main');
```

## 广播

通过`route`向主进程或渲染进程中的所有侦听器发送消息。

侦听器应使用`messageCenter.on()`监听通道。

```js
// 在第一个渲染进程中监听
import { messageCenter } from 'electron-message-center';
messageCenter.on('writeSettingsFile', (event, newSettings) => {
  console.log(newSettings);
});

// 在第二个渲染进程中监听
import { messageCenter } from 'electron-message-center';
messageCenter.on('writeSettingsFile', (event, newSettings) => {
  console.log(newSettings);
});

// 在主进程中监听
import { messageCenter } from 'electron-message-center/main';
messageCenter.on('writeSettingsFile', (event, newSettings) => {
  console.log(newSettings);
});

// 在渲染进程中广播
import { messageCenter } from 'electron-message-center';
messageCenter.broadcast('writeSettingsFile', '{ "name": "Jeff" }');

// 在主进程中广播
import { messageCenter } from 'electron-message-center/main';
messageCenter.broadcast('writeSettingsFile', '{ "name": "Jeff" }');
```

## 调用

通过`route`向主进程或渲染进程发送消息，并异步地期望结果。

侦听器应使用`messageCenter.on()`监听通道。

```js
// 在渲染进程中监听
import { messageCenter } from 'electron-message-center';
messageCenter.on('writeSettingsFile', (event, newSettings) => {
  console.log(newSettings);
  return Promise.resolve(true);
});

// 在渲染进程中调用
import { messageCenter } from 'electron-message-center';
const ret = await messageCenter.invoke('writeSettingsFile', '{ "name": "Jeff" }');
console.log(ret); // true

// 在主进程中调用
import { messageCenter } from 'electron-message-center/main';
const ret = await messageCenter.invoke('writeSettingsFile', '{ "name": "Jeff" }');
console.log(ret); // true
```

## 预加载

从 Electron 5.0 开始，默认情况下禁用`nodeIntegration`。这意味着您无法直接导入`electron-message-center`。相反，您需要在打开`BrowserWindow`时使用[preload](https://www.electronjs.org/docs/api/browser-window)脚本。即使禁用了`nodeIntegration`，预加载脚本也可以访问内置函数，例如`require`。

```js
// main.js
const mainWindow = new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    sandbox: false,
    contextIsolation: false,
  },
  maximize: true,
});
```

```js
// preload.js
const { messageCenter } = require('electron-message-center');

window.messageCenter = messageCenter;
```

```js
// 在网页中

messageCenter.on('a', (event, ...args) => {
  console.log('a', ...args);
});
function send() {
  messageCenter.broadcast('a', 1, null, { a: 1 });
}
```

## 高级用法

#### 删除侦听器

您可以使用`off()`方法删除侦听器。

```js
// 在渲染进程中
import { messageCenter } from 'electron-message-center';

messageCenter.off('someRoute'); // 不再关心

// 在主进程中
import { messageCenter } from 'electron-message-center/main';

messageCenter.off('someRoute'); // 不再关心
```

## 示例

- [example](https://github.com/meteor199/electron-message-center/tree/main/packages/example)

## 注意

参数将使用[结构化克隆算法](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)进行序列化，就像[window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)一样，因此原型链不会包含在内。发送函数、Promise、Symbol、WeakMap 或 WeakSet 将引发异常。

## 许可证

MIT
