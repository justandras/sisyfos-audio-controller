import path from 'path'
import { MixerProtocolPresets } from '../../shared/src/constants/MixerProtocolPresets'
import { MixerRegistry } from '../src/plugins/MixerRegistry'
import { getPluginPathsFromArgv, loadPlugins } from '../src/plugins/PluginLoader'

describe('MixerRegistry', () => {
    it('merges plugin presets into getAllPresets and getProtocolList', () => {
        const registry = new MixerRegistry()
        registry.registerBuiltins(MixerProtocolPresets)

        const createConnection = jest.fn()
        registry.registerPlugin(
            {
                id: 'unit-test-plugin',
                version: '1.0.0',
                mixers: {
                    acmeDesk: { displayName: 'Acme Desk' },
                },
            },
            '/plugins/acme',
            {
                acmeDesk: {
                    displayName: 'Acme Desk',
                    protocol: {
                        label: 'Acme Desk',
                        protocol: 'custom' as any,
                        MAX_UPDATES_PER_SECOND: 10,
                        channelTypes: [],
                    },
                    createConnection,
                },
            },
        )

        expect(registry.hasPreset('midasMaster')).toBe(true)
        expect(registry.hasPreset('acmeDesk')).toBe(true)
        expect(registry.getAllPresets().acmeDesk.label).toBe('Acme Desk')

        const list = registry.getProtocolList()
        expect(list.find((entry) => entry.value === 'acmeDesk')).toEqual({
            value: 'acmeDesk',
            label: 'Acme Desk',
        })
    })

    it('dispatches plugin createConnection for plugin preset keys', () => {
        const registry = new MixerRegistry()
        registry.registerBuiltins(MixerProtocolPresets)

        const mockConnection = { kind: 'plugin-connection' }
        const createConnection = jest.fn(() => mockConnection)

        registry.registerPlugin(
            {
                id: 'unit-test-plugin',
                version: '1.0.0',
                mixers: {
                    acmeDesk: { displayName: 'Acme Desk' },
                },
            },
            '/plugins/acme',
            {
                acmeDesk: {
                    displayName: 'Acme Desk',
                    protocol: {
                        label: 'Acme Desk',
                        protocol: 'custom' as any,
                        MAX_UPDATES_PER_SECOND: 10,
                        channelTypes: [],
                    },
                    createConnection,
                },
            },
        )

        const connection = registry.createConnection('acmeDesk', 0)
        expect(createConnection).toHaveBeenCalled()
        expect(connection).toBe(mockConnection)
    })
})

describe('PluginLoader', () => {
    const fixturePluginPath = path.resolve(
        __dirname,
        'fixtures/plugins',
    )
    const previousPluginPath = process.env.SISYFOS_PLUGIN_PATH
    const previousArgv = process.argv

    afterEach(() => {
        process.argv = previousArgv
        if (previousPluginPath === undefined) {
            delete process.env.SISYFOS_PLUGIN_PATH
        } else {
            process.env.SISYFOS_PLUGIN_PATH = previousPluginPath
        }
    })

    it('loads a Tier 1 plugin from SISYFOS_PLUGIN_PATH', () => {
        process.env.SISYFOS_PLUGIN_PATH = fixturePluginPath

        const registry = new MixerRegistry()
        registry.registerBuiltins(MixerProtocolPresets)
        loadPlugins(registry)

        expect(registry.hasPreset('testPluginMixer')).toBe(true)
        expect(registry.getProtocol('testPluginMixer').label).toBe(
            'Test Plugin Mixer',
        )

        const connection = registry.createConnection('testPluginMixer', 0)
        expect(connection).toBeDefined()
        expect(typeof connection?.updateMuteState).toBe('function')
    })

    it('loads a Tier 1 plugin from --plugin-path argv', () => {
        delete process.env.SISYFOS_PLUGIN_PATH
        process.argv = [
            'node',
            'server',
            '--inspect',
            '--plugin-path',
            fixturePluginPath,
        ]

        const registry = new MixerRegistry()
        registry.registerBuiltins(MixerProtocolPresets)
        loadPlugins(registry)

        expect(registry.hasPreset('testPluginMixer')).toBe(true)
    })

    it('parses --plugin-path=/path and --sisyfos-plugin-path forms', () => {
        expect(
            getPluginPathsFromArgv([
                'node',
                'server',
                '--plugin-path=/plugins/a',
                '--sisyfos-plugin-path',
                '/plugins/b',
            ]),
        ).toEqual(['/plugins/a', '/plugins/b'])
    })
})
