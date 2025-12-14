import { useSpaceshipStore } from '../../stores/spaceshipStore'
import { useMemo, useState, useEffect } from 'react'
import './SpaceshipHUD.css'

/**
 * SpaceshipHUD - HUD overlay for spaceship mode
 * 
 * Features:
 * - Speedometer (vertical equalizer bar + km/s value)
 * - Interstellar speeds simulation
 * - Smooth animated gauge transitions
 * - "Press T to exit" hint
 * - Boost indicator
 */

// Interstellar speed simulation
const SPEED_MULTIPLIER = 300 // Convert game speed to km/s

export const SpaceshipHUD = () => {
    const speed = useSpaceshipStore(state => state.speed)
    const maxSpeed = useSpaceshipStore(state => state.maxSpeed)
    const isBoosting = useSpaceshipStore(state => state.isBoosting)
    const boostMultiplier = useSpaceshipStore(state => state.boostMultiplier)
    const barrierIntensity = useSpaceshipStore(state => state.barrierIntensity)
    
    // Animated fill level (0-100%)
    const [animatedFill, setAnimatedFill] = useState(0)
    
    // Convert game speed to interstellar speed (km/s)
    const displaySpeed = useMemo(() => {
        const baseSpeed = speed * SPEED_MULTIPLIER * (1 - barrierIntensity)
        return Math.round(baseSpeed)
    }, [speed, barrierIntensity])
    
    // Gauge thresholds based on actual observed speeds
    // Normal cruise: 300 km/s → 50%
    // Boost cruise: 900 km/s → 100%
    const NORMAL_MAX = 300  // km/s at normal max
    const BOOST_MAX = 900   // km/s at boost max
    
    // Calculate target fill percentage
    // 0% = stopped, 50% = normal max speed (300), 100% = boost max speed (900)
    const targetFill = useMemo(() => {
        if (displaySpeed <= 0) return 0
        
        if (isBoosting) {
            // During boost, scale 0 to 100% based on 900 km/s
            return Math.min((displaySpeed / BOOST_MAX) * 100, 100)
        } else {
            // Normal cruise, scale 0 to 50% based on 300 km/s
            return Math.min((displaySpeed / NORMAL_MAX) * 50, 50)
        }
    }, [displaySpeed, isBoosting])
    
    // Smooth animation for fill level
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimatedFill(prev => {
                const diff = targetFill - prev
                if (Math.abs(diff) < 0.5) return targetFill
                return prev + diff * 0.15 // Smooth lerp
            })
        }, 16) // ~60fps
        
        return () => clearInterval(interval)
    }, [targetFill])
    
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
                        const isBoostBar = barIndex >= 5 && isActive
                        return (
                            <div 
                                key={i}
                                className={`
                                    spaceship-speedometer__bar 
                                    ${isActive ? 'spaceship-speedometer__bar--active' : ''}
                                    ${isBoostBar ? 'spaceship-speedometer__bar--boost' : ''}
                                `}
                            />
                        )
                    })}
                </div>
                <div className={`spaceship-speedometer__value ${isBoosting ? 'spaceship-speedometer__value--boost' : ''}`}>
                    {formattedSpeed} <span className="spaceship-speedometer__unit">km/s</span>
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
                    <span className="key spacer">ESPACE</span>
                    <span className="key-label">Boost</span>
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

