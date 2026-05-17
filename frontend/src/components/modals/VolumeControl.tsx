import { useState, useEffect, useRef } from 'react';
import { SoundInstance } from '../../scene3D/scripts/managers/SoundManager';

export default function VolumeControl() {
    const [isOpen, setIsOpen] = useState(false);
    const [volume, setVolume] = useState(SoundInstance.getMasterVolume());
    const containerRef = useRef<HTMLDivElement>(null);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        SoundInstance.setMasterVolume(val);
    };

    // Fecha ao clicar fora
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const icon = volume === 0 ? '♫⊘' : volume < 0.5 ? '♫◔' : '♫◕';

    return (
        <div className="volume-control" ref={containerRef}>
            {isOpen && (
                <div className="volume-popover">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="volume-slider"
                        style={{ '--volume-fill': `${volume * 100}%` } as React.CSSProperties}
                    />
                </div>
            )}

            <button
                className="volume-fab"
                onClick={() => setIsOpen(prev => !prev)}
                aria-label="Volume"
            >
                {icon}
            </button>
        </div>
    );
}
