import { useState, useEffect } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { useTranslation } from '../../hooks/useTranslation'
import './WaveAnnouncement.css'

/**
 * WaveAnnouncement - HTML/CSS overlay for wave start
 * 
 * Same style as Zone Limite warning:
 * - Orbitron font
 * - Neon glow effect
 * - Warning icons
 */
export const WaveAnnouncement = () => {
    const [visible, setVisible] = useState(false)
    const [waveInfo, setWaveInfo] = useState({ wave: 0, enemies: 0 })
    const { t } = useTranslation()
    
    const currentWave = useGameStore(state => state.currentWave)
    const isWaveActive = useGameStore(state => state.isWaveActive)
    
    // Show/hide based on wave state
    useEffect(() => {
        if (isWaveActive && currentWave > 0) {
            const totalEnemies = currentWave + 1
            setWaveInfo({ wave: currentWave, enemies: totalEnemies })
            setVisible(true)
            
            // Hide after 4 seconds
            const timer = setTimeout(() => {
                setVisible(false)
            }, 4000)
            return () => clearTimeout(timer)
        }
    }, [isWaveActive, currentWave])
    
    if (!visible) return null
    
    return (
        <div className="wave-announcement">
            <div className="wave-content">
                <div className="wave-icon">⚠</div>
                <div className="wave-text">
                    <div className="wave-title">{t('game.wave')} {waveInfo.wave}</div>
                    <div className="wave-subtitle">{t('game.hostilesDetected')} - {waveInfo.enemies} {t('game.targets')}</div>
                </div>
                <div className="wave-icon">⚠</div>
            </div>
        </div>
    )
}
