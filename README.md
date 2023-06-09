[中文](./README_zh.md)

# electron-message-center

An easy-to-use npm package for streamlining inter-process communication in Electron applications. Supports cross-window communication and other advanced messaging features.

[![publish](https://github.com/meteor199/electron-message-center/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/meteor199/electron-message-center/actions/workflows/npm-publish.yml)
[![ci](https://github.com/meteor199/electron-message-center/actions/workflows/ci.yml/badge.svg)](https://github.com/meteor199/electron-message-center/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/electron-message-center.svg?kill_cache=1)](https://badge.fury.io/js/electron-message-center)
[![codecov](https://codecov.io/gh/meteor199/electron-message-center/branch/main/graph/badge.svg)](https://codecov.io/gh/meteor199/electron-message-center)

## Installation

First, you need to install it from NPM:

```sh
npm install --save electron-message-center
```

Second, electron-message-center must be initialized in the main process:

```js
require('electron-message-center/main');
```

## Broadcast

Send a message to all listeners in the main process or renderer processes via `route`.

Listeners should listen for the channel with `messageCenter.on()`.

```js
// listen in first renderer process
import { messageCenter } from 'electron-message-center';
messageCenter.on('writeSettingsFile', (event, newSettings) => {
  console.log(newSettings);
});

// listen in second renderer process
import { messageCenter } from 'electron-message-center';
messageCenter.on('writeSettingsFile', (event, newSettings) => {
  console.log(newSettings);
});

// listen in main process
import { messageCenter } from 'electron-message-center/main';
messageCenter.on('writeSettingsFile', (event, newSettings) => {
  console.log(newSettings);
});

// broadcast in renderer process
import { messageCenter } from 'electron-message-center';
messageCenter.broadcast('writeSettingsFile', '{ "name": "Jeff" }');

// broadcast in main process
import { messageCenter } from 'electron-message-center/main';
messageCenter.broadcast('writeSettingsFile', '{ "name": "Jeff" }');
```

## Invoke

Send a message to the main process or renderers via `route` and expect a result asynchronously.

Listeners should listen for the channel with `messageCenter.on()`.

```js
// listen in renderer process
import { messageCenter } from 'electron-message-center';
messageCenter.on('writeSettingsFile', (event, newSettings) => {
  console.log(newSettings);
  return Promise.resolve(true);
});

// invoke in renderer process
import { messageCenter } from 'electron-message-center';
const ret = await messageCenter.invoke('writeSettingsFile', '{ "name": "Jeff" }');
console.log(ret); // true

// invoke in main process
import { messageCenter } from 'electron-message-center/main';
const ret = await messageCenter.invoke('writeSettingsFile', '{ "name": "Jeff" }');
console.log(ret); // true
```

## Preload

As of Electron 5.0, `nodeIntegration` is _disabled by default._ This means that you cannot import `electron-message-center` directly. Instead, you will need to use a [preload](https://www.electronjs.org/docs/api/browser-window) script when opening a `BrowserWindow`. Preload scripts can access builtins such as `require` even if `nodeIntegration` is disabled.

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
// in the web page

messageCenter.on('a', (event, ...args) => {
  console.log('a', ...args);
});
function send() {
  messageCenter.broadcast('a', 1, null, { a: 1 });
}
```

## Advanced usage

#### Invoke with specified WebContents

By default, `invoke` sends the message to the first listener it finds. If you want to specify a particular renderer process to receive the message, you can pass the webContents ID like so:

```js
// invoke in renderer process
import { MessageCenter } from 'electron-message-center';

const messageCenter = new MessageCenter({ webContentsId: 1 });
const ret = await messageCenter.invoke('writeSettingsFile', '{ "name": "Jeff" }');

// or broadcast
messageCenter.broadcast('writeSettingsFile', '{ "name": "Jeff" }');

console.log(ret); // true

// listen in renderer process
import { messageCenter } from 'electron-message-center';
messageCenter.on('writeSettingsFile', (event, newSettings) => {
  console.log(newSettings);
  return Promise.resolve(true);
});
```

#### Timeouts

By default, the `invoke` method will wait indefinitely for the other process to return data. If you want to set a timeout (after which the promise will be automatically rejected), you can create another instance of `MessageCenter` like so:

```js
// invoke in renderer process
import { MessageCenter } from 'electron-message-center';

const messageCenter = new MessageCenter({ timeout: 2000 });
try {
  await messageCenter.invoke('writeSettingsFile', '{ "name": "Jeff" }');
} catch (e) {
  console.error(e);
}

// listen in renderer process
import { messageCenter } from 'electron-message-center';
messageCenter.on('writeSettingsFile', (event, newSettings) => {
  return someOperationThatNeverCompletesUhOh();
});
```

#### Removing Listeners

You can remove a listener with the `off()` method.

```js
// in renderer process
import { messageCenter } from 'electron-message-center';

messageCenter.off('someRoute'); // never mind

// in main process
import { messageCenter } from 'electron-message-center/main';

messageCenter.off('someRoute'); // never mind
```

## Example

- [example](https://github.com/meteor199/electron-message-center/tree/main/packages/example)

## Notice

Arguments will be serialized with the [Structured Clone Algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm), just like [window.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage), so prototype chains will not be included. Sending Functions, Promises, Symbols, WeakMaps, or WeakSets will throw an exception.

## License

MIT
