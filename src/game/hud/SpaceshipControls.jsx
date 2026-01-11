import { useState, useEffect } from 'react'
import { useSpaceshipStore } from '../../stores/spaceshipStore'
import { useGameStore } from '../../stores/gameStore'
import { useIsMobile } from '../../hooks/useIsMobile'
import './SpaceshipControls.css'

/**
 * SpaceshipControls - Minimal sci-fi control hints overlay
 * Shows when spaceship mode is active
 * Includes boundary warning message and wave announcements
 * Keyboard controls hidden on mobile (MobileControls handles touch input)
 */
export const SpaceshipControls = () => {
    const isSpaceshipMode = useSpaceshipStore(state => state.isSpaceshipMode)
    const barrierIntensity = useSpaceshipStore(state => state.barrierIntensity)
    const isMobile = useIsMobile(768)
    
    // Wave announcement state
    const currentWave = useGameStore(state => state.currentWave)
    const isWaveActive = useGameStore(state => state.isWaveActive)
    const [showWaveAnnouncement, setShowWaveAnnouncement] = useState(false)
    const [waveInfo, setWaveInfo] = useState({ wave: 0, enemies: 0 })
    
    // Show wave announcement when wave starts
    useEffect(() => {
        if (isWaveActive && currentWave > 0) {
            const totalEnemies = currentWave + 1
            setWaveInfo({ wave: currentWave, enemies: totalEnemies })
            setShowWaveAnnouncement(true)
            console.log('[SpaceshipControls] Showing wave', currentWave)
            
            const timer = setTimeout(() => {
                setShowWaveAnnouncement(false)
                console.log('[SpaceshipControls] Hiding wave announcement')
            }, 4000)
            return () => clearTimeout(timer)
        }
    }, [isWaveActive, currentWave])
    
    if (!isSpaceshipMode) return null
    
    // Show boundary warning at ~195 units (75% into slowdown zone: 180→200)
    const showWarning = barrierIntensity > 0.75
    
    return (
        <>
            {/* Wave Announcement - top of screen, BIGGER */}
            {showWaveAnnouncement && (
                <div className="ship-boundary-warning" style={{ top: '25%' }}>
                    <div className="warning-content" style={{ gap: '40px' }}>
                        <div className="warning-icon" style={{ fontSize: '48px' }}>⚠</div>
                        <div className="warning-text">
                            <div className="warning-title" style={{ fontSize: '42px', letterSpacing: '8px' }}>VAGUE {waveInfo.wave}</div>
                            <div className="warning-subtitle" style={{ fontSize: '16px', letterSpacing: '4px', marginTop: '8px' }}>ENNEMIS DÉTECTÉS - {waveInfo.enemies} CIBLES</div>
                        </div>
                        <div className="warning-icon" style={{ fontSize: '48px' }}>⚠</div>
                    </div>
                </div>
            )}
            
            {/* Boundary Warning - center screen */}
            {showWarning && (
                <div className="ship-boundary-warning">
                    <div className="warning-content">
                        <div className="warning-icon">⚠</div>
                        <div className="warning-text">
                            <div className="warning-title">ZONE LIMITE</div>
                            <div className="warning-subtitle">DEMI-TOUR REQUIS</div>
                        </div>
                        <div className="warning-icon">⚠</div>
                    </div>
                </div>
            )}
            
            {/* Desktop only: Exit hint and controls (hidden on mobile) */}
            {!isMobile && (
                <>
                    {/* Exit hint at top */}
                    <div className="ship-exit-hint">
                        <span className="ship-key">T</span>
                        <span className="ship-label">Quitter</span>
                    </div>
                    
                    {/* Controls at bottom */}
                    <div className="ship-controls">
                        <div className="ship-control-group">
                            <span className="ship-key">↑↓←→</span>
                            <span className="ship-label">Piloter</span>
                        </div>
                        <div className="ship-control-group">
                            <span className="ship-key">SHIFT</span>
                            <span className="ship-label">Accélérer</span>
                        </div>
                        <div className="ship-control-group">
                            <span className="ship-key">CTRL</span>
                            <span className="ship-label">Freiner</span>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
