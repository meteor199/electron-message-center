# electron-message-center

An easy-to-use npm package for streamlining inter-process communication in Electron applications. Supports cross-window communication and other advanced messaging features.

[![publish](https://github.com/meteor199/electron-message-center/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/meteor199/electron-message-center/actions/workflows/npm-publish.yml)
[![ci](https://github.com/meteor199/electron-message-center/actions/workflows/ci.yml/badge.svg)](https://github.com/meteor199/electron-message-center/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/electron-message-center.svg)](https://badge.fury.io/js/electron-message-center)
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

```js
// listen in first renderer
import { messageCenter } from 'electron-message-center';
messageCenter.on('writeSettingsFile', newSettings => {
  console.log(newSettings);
});

// listen in second renderer
import { messageCenter } from 'electron-message-center';
messageCenter.on('writeSettingsFile', newSettings => {
  console.log(newSettings);
});

// listen in main process
import { messageCenter } from 'electron-message-center/main';
messageCenter.on('writeSettingsFile', newSettings => {
  console.log(newSettings);
});

// broadcast in renderer
import { messageCenter } from 'electron-message-center';
messageCenter.broadcast('writeSettingsFile', '{ "name": "Jeff" }');

// broadcast in main process
import { messageCenter } from 'electron-message-center/main';
messageCenter.broadcast('writeSettingsFile', '{ "name": "Jeff" }');
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

messageCenter.on('a', (...args) => {
  console.log('a', ...args);
});
function send() {
  messageCenter.broadcast('a', 1, null, { a: 1 });
}
```

## Advanced usage

#### Removing Listeners

You can remove a listener with the `off()` method.

```js
// in renderer
import { messageCenter } from 'electron-message-center';

messageCenter.off('someRoute'); // never mind

// in main process
import { messageCenter } from 'electron-message-center/main';

messageCenter.off('someRoute'); // never mind
```

## example

- [example](https://github.com/meteor199/electron-message-center/tree/main/packages/example)

## License

MIT
