import { MixerProtocolGeneric } from './MixerProtocolInterface'

export interface MixerPluginManifestEntry {
    displayName: string
}

export interface MixerPluginManifest {
    id: string
    version: string
    mixers: Record<string, MixerPluginManifestEntry>
}

export type MixerConnectionFactory = (
    protocol: MixerProtocolGeneric,
    mixerIndex: number,
) => unknown

export interface MixerPluginEntry {
    displayName: string
    protocol: MixerProtocolGeneric
    createConnection: MixerConnectionFactory
}

export interface MixerPluginModule {
    Mixers: Record<string, MixerPluginEntry>
}
