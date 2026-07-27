# Example Tier 1 Mixer Plugin

This folder shows the minimum shape of a proprietary mixer plugin loaded at runtime via `SISYFOS_PLUGIN_PATH`.

## Layout

```
my-mixer-plugin/
  manifest.json
  index.js              # compiled entrypoint
  MyMixerConnection.js  # implements MixerConnection
  package.json          # optional, for proprietary SDK deps
```

## manifest.json

```json
{
  "id": "my-mixer-plugin",
  "version": "1.0.0",
  "mixers": {
    "myProDesk": {
      "displayName": "My Pro Desk"
    }
  }
}
```

## index.js

```js
const { MyMixerConnection } = require('./MyMixerConnection')

module.exports = {
  Mixers: {
    myProDesk: {
      displayName: 'My Pro Desk',
      protocol: {
        label: 'My Pro Desk',
        protocol: 'custom',
        MAX_UPDATES_PER_SECOND: 15,
        channelTypes: [/* see shared MixerProtocolInterface */],
        fader: { min: 0, max: 1, zero: 0.75, step: 0.01 },
      },
      createConnection: (protocol, mixerIndex) =>
        new MyMixerConnection(protocol, mixerIndex),
    },
  },
}
```

## Deployment

1. Build your plugin to JavaScript (CommonJS).
2. Copy the plugin directory to a path referenced by `SISYFOS_PLUGIN_PATH` or `--plugin-path`, or place it under `{storage}/plugins/`.
3. Restart the Sisyfos server.
4. Select the plugin mixer in Settings.

See also the working test fixture at `server/__tests__/fixtures/plugins/test-mixer/`.
