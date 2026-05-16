import * as B from '@babylonjs/core';

// ─── Categorias de Som ────────────────────────────────────────

export const SoundCategory = {
    SFX: 'sfx',
    UI:  'ui',
} as const;

export type SoundCategory = typeof SoundCategory[keyof typeof SoundCategory];

// ─── Tipos Internos ───────────────────────────────────────────

interface SoundEntry {
    sound: B.StaticSound;
    category: SoundCategory;
}

export interface SoundLoadOptions {
    spatialEnabled?: boolean;
    loop?: boolean;
    volume?: number;
}

// ─── Manager ──────────────────────────────────────────────────

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

    // ── Inicialização ──────────────────────────────────────

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

        this._isReady = true;
    }


    /**
     * Desbloqueia o áudio (deve ser chamado a partir de um evento de interação do usuário).
     * Browsers bloqueiam autoplay até que o usuário interaja com a página.
     */
    public async unlock(): Promise<void> {
        if (!this.audioEngine) return;
        await this.audioEngine.unlockAsync();
    }

    // ── Carregamento de Sons ────────────────────────────────

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
            outBus:         bus ?? undefined,
        }, this.audioEngine);

        this.sounds.set(key, { sound, category });
    }

    // ── Playback ─────────────────────────────────────────────

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

    // ── Áudio Espacial ───────────────────────────────────────

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

    // ── Volume ───────────────────────────────────────────────

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

    // ── Utilitários ──────────────────────────────────────────

    public getSound(key: string): B.StaticSound | undefined {
        return this.sounds.get(key)?.sound;
    }

    // ── Cleanup ──────────────────────────────────────────────

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
