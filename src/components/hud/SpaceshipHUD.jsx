import { useSpaceshipStore } from '../../stores/spaceshipStore'
import { useMemo, useState, useEffect, useRef } from 'react'
import './SpaceshipHUD.css'

/**
 * SpaceshipHUD - HUD overlay for spaceship mode
 * 
 * Features:
 * - Speedometer (vertical equalizer bar + km/h value)
 * - Smooth animated gauge transitions
 * - "Press T to exit" hint
 * - Boost indicator
 */

// Speed thresholds in km/h
const MAX_SPEED_KMH = 1117

export const SpaceshipHUD = () => {
    const speed = useSpaceshipStore(state => state.speed) // Already in km/h
    const isBoosting = useSpaceshipStore(state => state.isBoosting)
    const barrierIntensity = useSpaceshipStore(state => state.barrierIntensity)
    
    // Animated fill level (0-100%)
    const [animatedFill, setAnimatedFill] = useState(0)
    const targetFillRef = useRef(0)
    
    // Display speed directly in km/h (already the right unit from store)
    const displaySpeed = useMemo(() => {
        return Math.round(speed * (1 - barrierIntensity))
    }, [speed, barrierIntensity])
    
    // Calculate target fill percentage and update ref
    // 0% = stopped, 50% = half max (558 km/h), 100% = max speed (1117 km/h)
    useEffect(() => {
        if (displaySpeed <= 0) {
            targetFillRef.current = 0
        } else {
            targetFillRef.current = Math.min((displaySpeed / MAX_SPEED_KMH) * 100, 100)
        }
    }, [displaySpeed])
    
    // Smooth animation for fill level - runs continuously
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimatedFill(prev => {
                const diff = targetFillRef.current - prev
                if (Math.abs(diff) < 0.5) return targetFillRef.current
                return prev + diff * 0.15 // Smooth lerp
            })
        }, 16) // ~60fps
        
        return () => clearInterval(interval)
    }, []) // Empty deps - runs once, uses ref for current target
    
    // Convert to bar count (10 bars)
    const fillLevel = Math.ceil((animatedFill / 100) * 10)
    
    // Format speed with thousands separator
    const formattedSpeed = displaySpeed.toLocaleString('fr-FR')
    
    return (
        <div className="spaceship-hud">
            {/* Speedometer - Bottom Right */}
            <div className="spaceship-speedometer">
                <div className="spaceship-speedometer__label">VITESSE</div>
                <div className="spaceship-speedometer__equalizer">
                    {[...Array(10)].map((_, i) => {
                        const barIndex = 9 - i // Reverse for bottom-to-top fill
                        const isActive = barIndex < fillLevel
                        const isBoostBar = barIndex >= 5 && barIndex < 9 && isActive
                        const isMaxBar = barIndex === 9 && isActive // Last bar = MAX = RED
                        return (
                            <div 
                                key={i}
                                className={`
                                    spaceship-speedometer__bar 
                                    ${isActive ? 'spaceship-speedometer__bar--active' : ''}
                                    ${isBoostBar ? 'spaceship-speedometer__bar--boost' : ''}
                                    ${isMaxBar ? 'spaceship-speedometer__bar--max' : ''}
                                `}
                            />
                        )
                    })}
                </div>
                <div className={`spaceship-speedometer__value ${isBoosting ? 'spaceship-speedometer__value--boost' : ''}`}>
                    {formattedSpeed} <span className="spaceship-speedometer__unit">km/h</span>
                </div>
            </div>
            
            {/* Controls hint - Bottom Center */}
            <div className="spaceship-controls-hint">
                <div className="spaceship-controls-hint__keys">
                    <span className="key">↑</span>
                    <span className="key">↓</span>
                    <span className="key">←</span>
                    <span className="key">→</span>
                    <span className="key-label">Piloter</span>
                    <span className="key spacer">SHIFT</span>
                    <span className="key-label">Accélérer</span>
                    <span className="key">CTRL</span>
                    <span className="key-label">Freiner</span>
                </div>
                <div className="spaceship-controls-hint__exit">
                    Appuyez sur <span className="key">T</span> pour quitter
                </div>
            </div>
            
            {/* Boost indicator */}
            {isBoosting && (
                <div className="spaceship-boost-indicator">
                    BOOST ACTIF
                </div>
            )}
            
            {/* Boundary warning - appears when approaching limit */}
            {barrierIntensity > 0.1 && (
                <div className="spaceship-boundary-warning">
                    <div className="spaceship-boundary-warning__text">
                        ⚠ TURN BACK ⚠
                    </div>
                    <div className="spaceship-boundary-warning__subtext">
                        BOUNDARY LIMIT REACHED
                    </div>
                </div>
            )}
        </div>
    )
}

