import * as B from '@babylonjs/core';



export interface AnimatedModelInstance {
    rootNodes: B.InstantiatedEntries["rootNodes"];
    animationGroups: B.AnimationGroup[];
    skeletons: B.Skeleton[];
}


class AnimationManager {
    
    // Mapa: entityKey → AnimationGroup[] daquela instância
    private registry: Map<string, B.AnimationGroup[]> = new Map();

    public fps = 60;

    public register(key: string, groups: B.AnimationGroup[]): void {
        this.registry.set(key, groups);
    }

    public play(key: string, animName: string, loop: boolean = true, speed = 1): void {

        // const groups = this.registry.get(key);
        // groups?.forEach(ag => ag.stop());

        const target = this.findAnimationGroup(key, animName);
        
        if (!target) { return; }

        target.stop();
        target.reset();
        target.start(loop, speed);
    }

    public playAndWait(key: string, animName: string): Promise<void> {
        return new Promise((resolve) => {
            
            const groups = this.registry.get(key);
            groups?.forEach(ag => ag.stop());

            const target = this.findAnimationGroup(key, animName);
     
            if (!target) { resolve(); return; }
            // Escuta o fim da animação UMA vez
            target.onAnimationGroupEndObservable.addOnce(() => resolve());
            target.start(false); // false = sem loop, senão nunca resolve
        });
    }

    public stop(key: string): void {
        
        this.registry.get(key)?.forEach(ag => {
            ag.goToFrame(ag.from);  // reseta os bones para o frame inicial
            ag.stop();
        });

    }

    public getGroups(key: string): B.AnimationGroup[] | undefined {
        return this.registry.get(key);
    }

    public findAnimationGroup(key : string, animName : string) : B.AnimationGroup | void {
        
        const groups = this.registry.get(key);
    
        if (!groups) return;

        return groups.find(ag =>
                ag.name.toLowerCase().includes(animName.toLowerCase())
            );
    }

    public getDurationMs(key: string, animName: string): number {

        const target = this.findAnimationGroup(key, animName);
     
        if (!target) return 0;
     
        const fps = target.targetedAnimations[0]?.animation.framePerSecond ?? 30;
     
        const frames = target.to - target.from;
     
        return (frames / fps) * 1000; // converte para milissegundos
    }

    // Limpa ao resetar a cena
    public dispose(): void {
        this.registry.forEach(groups => groups.forEach(ag => ag.dispose()));
        this.registry.clear();

    }


}

export const AnimationInstance = new AnimationManager();
