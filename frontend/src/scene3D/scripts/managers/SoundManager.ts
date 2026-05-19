import * as B from '@babylonjs/core';

export const SoundCategory = {
    SFX: 'sfx',
    UI:  'ui',
} as const;

export type SoundCategory = typeof SoundCategory[keyof typeof SoundCategory];

interface SoundEntry {
    sound: B.StaticSound;
    category: SoundCategory;
}

export interface SoundLoadOptions {
    spatialEnabled?: boolean;
    loop?: boolean;
    volume?: number;
    autoplay?: boolean;
}


class SoundManager {

    private audioEngine: B.AudioEngineV2 | null = null;
    private buses: Map<SoundCategory, B.AudioBus> = new Map();
    private sounds: Map<string, SoundEntry> = new Map();

    // Volume default por categoria
    private volumes: Map<SoundCategory, number> = new Map([
        [SoundCategory.SFX, 1],
        [SoundCategory.UI,  1],
    ]);

    private _isReady = false;
    public get isReady(): boolean { return this._isReady; }

    
    public async initialize(): Promise<void> {
        if (this.audioEngine) return; // já inicializado

        this.audioEngine = await B.CreateAudioEngineAsync({
            disableDefaultUI: true,      // Gerenciamos o unlock manualmente
        });

        // Cria buses por categoria
        for (const category of Object.values(SoundCategory)) {
            const bus = await B.CreateAudioBusAsync(
                `bus_${category}`, {}, this.audioEngine
            );
            bus.volume = this.volumes.get(category) ?? 1;
            this.buses.set(category, bus);
        }

        await this.initializeSounds();
        
        this._isReady = true;
    }


    private async initializeSounds(): Promise<void> {

        const loadTasks = [
            // Ambience
            () => this.load("wind",  "/sounds/scene/desert_wind.mp3",  SoundCategory.SFX, { volume: .15, loop: true, autoplay: true }),
            // Rover
            () => this.load("rover_idle",  "/sounds/scene/rover/rover_idle_motor.mp3",  SoundCategory.SFX, { volume: .3, spatialEnabled: true, loop: true, autoplay: true,  }),
            () => this.load("rover_move",  "/sounds/scene/rover/rover_move_motor.mp3",  SoundCategory.SFX, { volume: 0, spatialEnabled: true, loop: true }),
            () => this.load("rover_turn",  "/sounds/scene/rover/rover_turn_motor.mp3",  SoundCategory.SFX, { volume: 0, spatialEnabled: true, loop: true }),
            // Eventos
            () => this.load("sim_success", "/sounds/event/win_effect.mp3", SoundCategory.SFX, { volume: .3 }),
            () => this.load("sim_error", "/sounds/event/error_effect.mp3", SoundCategory.SFX, { volume: .4 }),
            () => this.load("sim_end", "/sounds/event/end_effect.mp3", SoundCategory.SFX, { volume: .7 }),
            // UI
            () => this.load("btn_hover",    "/sounds/ui/button_hover.mp3",       SoundCategory.UI),
            () => this.load("btn_click_1",    "/sounds/ui/button_click_1.mp3",   SoundCategory.UI, { volume: .5 }),
            () => this.load("btn_click_2",    "/sounds/ui/button_click_2.mp3",   SoundCategory.UI, { volume: .5 }),
            () => this.load("btn_click_3",    "/sounds/ui/button_click_3.mp3",   SoundCategory.UI, { volume: .5 }),
            () => this.load("btn_switch_1",    "/sounds/ui/btn_switch_1.mp3",    SoundCategory.UI, { volume: .4 }),
            () => this.load("btn_switch_2",    "/sounds/ui/btn_switch_2.mp3",    SoundCategory.UI, { volume: .4 }),
        ];

        await Promise.all(loadTasks.map(task => task()));
    }


    /**
     * Desbloqueia o áudio (deve ser chamado a partir de um evento de interação do usuário).
     * Browsers bloqueiam autoplay até que o usuário interaja com a página.
     */
    public async unlock(): Promise<void> {
        if (!this.audioEngine) return;
        await this.audioEngine.unlockAsync();
    }


    public async load(
        key: string,
        path: string,
        category: SoundCategory,
        options?: SoundLoadOptions
    ): Promise<void> {

        if (!this.audioEngine) {
            console.warn(`[SoundManager] Engine não inicializada. Chame initialize() primeiro.`);
            return;
        }

        // Evita duplicatas
        if (this.sounds.has(key)) return;

        const bus = this.buses.get(category);

        const sound = await B.CreateSoundAsync(key, path, {
            spatialEnabled: options?.spatialEnabled ?? false,
            loop:           options?.loop ?? false,
            volume:         options?.volume ?? 1,
            autoplay:       options?.autoplay ?? false,
            outBus:         bus ?? undefined,
        }, this.audioEngine);

        this.sounds.set(key, { sound, category });
    }



    public play(key: string, loop?: boolean): void {
        const entry = this.sounds.get(key);
        if (!entry) return;

        entry.sound.play({ loop: loop ?? entry.sound.loop });
    }

    public stop(key: string): void {
        const entry = this.sounds.get(key);
        if (!entry) return;

        entry.sound.stop();
    }

    public pause(key: string): void {
        this.sounds.get(key)?.sound.pause();
    }

    public resume(key: string): void {
        this.sounds.get(key)?.sound.resume();
    }

    /**
     * Vincula um som já carregado a um mesh/TransformNode.
     * O som acompanha automaticamente a posição do mesh.
     * O som precisa ter sido carregado com `spatialEnabled: true`.
     */
    public attachToMesh(key: string, node: B.TransformNode): void {
        const entry = this.sounds.get(key);
        if (!entry) return;

        entry.sound.spatial.attach(node);
    }

    public configureSpatial(key: string, options: {
        distanceModel?: "linear" | "inverse" | "exponential";
        rolloffFactor?: number;
        refDistance?: number;
        maxDistance?: number;
    }): void {
        const entry = this.sounds.get(key);
        if (!entry) return;

        const spatial = entry.sound.spatial;
        if (!spatial) return;

        if (options.distanceModel !== undefined) spatial.distanceModel = options.distanceModel;
        if (options.rolloffFactor !== undefined) spatial.rolloffFactor = options.rolloffFactor;
        // if (options.refDistance !== undefined)   spatial.refDistance = options.refDistance;
        if (options.maxDistance !== undefined)   spatial.maxDistance = options.maxDistance;
    }

    /**
     * Vincula o listener de áudio a uma câmera.
     * Deve ser chamado sempre que a câmera ativa mudar.
     */
    public attachListenerToCamera(camera: B.Camera): void {
        if (!this.audioEngine) return;
        this.audioEngine.listener.attach(camera);
    }


    /**
     * Define o volume master (afeta todas as categorias).
     * @param volume - 0 a 1
     */
    public setMasterVolume(volume: number): void {
        if (!this.audioEngine) return;
        this.audioEngine.volume = Math.max(0, Math.min(volume, 1));
    }

    public getMasterVolume(): number {
        return this.audioEngine?.volume ?? 1;
    }

    /**
     * Define o volume de uma categoria específica.
     * @param category - SoundCategory
     * @param volume - 0 a 1
     */
    public setVolume(category: SoundCategory, volume: number): void {
        const clamped = Math.max(0, Math.min(volume, 1));
        this.volumes.set(category, clamped);

        const bus = this.buses.get(category);
        if (bus) bus.volume = clamped;
    }

    public getVolume(category: SoundCategory): number {
        return this.volumes.get(category) ?? 1;
    }

    public setSoundVolume(key: string, volume: number): void {
        const entry = this.sounds.get(key);

        if (!entry) return;
        entry.sound.volume = Math.max(0, Math.min(volume, 1));
    }

    public setSoundPlaybackRate(key: string, rate: number): void {
        const entry = this.sounds.get(key);

        if (!entry) return;
        entry.sound.playbackRate = Math.max(0.1, Math.min(rate, 4));
    }

    public getSound(key: string): B.StaticSound | undefined {
        return this.sounds.get(key)?.sound;
    }

    public dispose(): void {
        this.sounds.forEach(entry => entry.sound.dispose());
        this.sounds.clear();

        this.buses.forEach(bus => bus.dispose());
        this.buses.clear();

        this.audioEngine?.dispose();
        this.audioEngine = null;

        this._isReady = false;
    }
}

export const SoundInstance = new SoundManager();
