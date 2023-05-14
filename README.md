# electron-message-center

An easy-to-use npm package for streamlining inter-process communication in Electron applications. Supports cross-window communication and other advanced messaging features.

[![publish](https://github.com/meteor199/electron-message-center/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/meteor199/electron-message-center/actions/workflows/npm-publish.yml)

[![ci](https://github.com/meteor199/electron-message-center/actions/workflows/ci.yml/badge.svg)](https://github.com/meteor199/electron-message-center/actions/workflows/ci.yml)

[![npm version](https://badge.fury.io/js/electron-message-center.svg)](https://badge.fury.io/js/electron-message-center)

[![codecov](https://codecov.io/gh/meteor199/electron-message-center/branch/master/graph/badge.svg)](https://codecov.io/gh/meteor199/electron-message-centerr)

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
// in first renderer
import { messageCenter } from 'electron-message-center';
messageCenter.on('writeSettingsFile', newSettings => {
  console.log(newSettings);
});

// in second renderer
import { messageCenter } from 'electron-message-center';
messageCenter.broadcast('writeSettingsFile', '{ "name": "Jeff" }');

// in third renderer
import { messageCenter } from 'electron-message-center';
messageCenter.on('writeSettingsFile', newSettings => {
  console.log(newSettings);
});
```

## Advanced usage

#### Removing Listeners

You can remove a listener with the `off()` method.

```js
import { messageCenter } from 'electron-message-center';

messageCenter.on('someRoute', () => {
  return something();
});

messageCenter.off('someRoute'); // never mind
```

## example

- [example](https://github.com/meteor199/electron-message-center/tree/main/packages/example)

## License

MIT
