export interface ChannelReference {
    mixerIndex: number
    channelIndex: number
}

export interface Fader {
    faderLevel: number
    inputGain: number
    inputSelector: number
    pflOn: boolean
    pgmOn: boolean
    voOn: boolean
    pstOn: boolean
    pstVoOn: boolean
    muteOn: boolean
    amixOn: boolean
    label: string
    userLabel?: string
    assignedChannels?: ChannelReference[]
    [fxParam: number]: number[] | undefined
}

export interface MixerChannel {
    fadeActive: boolean
    channelType: number
    channelTypeIndex: number
    label: string
    outputLevel: number
    auxLevel: number[]
    assignedFader: number
}

export interface MixerSettings {
    deviceUrl: string
    nextSendAux: number
    mixerOnline: boolean
}

export interface Settings {
    autoResetLevel: number
    voLevel: number
    labelControlsIgnoreAutomation: boolean
    labelIgnorePrefix: string
    mixers: MixerSettings[]
}

export interface MixerProtocolGeneric {
    label: string
    protocol: string
    MAX_UPDATES_PER_SECOND: number
    pingTime?: number
    channelTypes: Array<{
        channelTypeName: string
        channelTypeColor: string
        fromMixer: Record<string, unknown>
        toMixer: Record<string, unknown>
    }>
    fader: {
        min: number
        max: number
        zero: number
        step: number
    }
    meter?: {
        min: number
        max: number
        zero: number
        test: number
    }
    presetFileExtension?: string
}

export interface SisyfosState {
    settings: Settings[]
    faders: Array<{ fader: Fader[] }>
    channels: Array<{
        chMixerConnection: Array<{
            channel: MixerChannel[]
        }>
    }>
}

export interface SisyfosStore {
    dispatch: (action: Record<string, unknown>) => void
}

export interface MainThreadHandler {
    updatePartialStore: (faderIndex: number) => void
    updateFullClientStore: () => void
    updateMixerOnline: (mixerIndex: number, online?: boolean) => void
}

export interface MixerGenericConnection {
    updateOutLevel: (
        faderIndex: number,
        delay: number,
        skipMixerIndex: number,
    ) => void
    updateMuteState: (faderIndex: number, mixerIndex: number) => void
}

export interface RemoteConnections {
    updateRemoteFaderState: (faderIndex: number, level: number) => void
    updateRemoteAuxPanels: () => void
}

export interface SisyfosHostModules {
    store: { store: SisyfosStore; state: SisyfosState }
    mainClasses: {
        mixerGenericConnection: MixerGenericConnection
        remoteConnections: RemoteConnections | null
    }
    logger: {
        info: (msg: string) => void
        error: (msg: string) => void
        trace: (msg: string) => void
        data: (data: unknown) => { error: (msg: string) => void }
    }
}

declare global {
    // eslint-disable-next-line no-var
    var mainThreadHandler: MainThreadHandler
}
