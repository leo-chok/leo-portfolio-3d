import { useSpaceshipStore } from '../../stores/spaceshipStore'
import './SpaceshipControls.css'

/**
 * SpaceshipControls - Minimal sci-fi control hints overlay
 * Shows when spaceship mode is active
 * Includes boundary warning message
 */
export const SpaceshipControls = () => {
    const isSpaceshipMode = useSpaceshipStore(state => state.isSpaceshipMode)
    const barrierIntensity = useSpaceshipStore(state => state.barrierIntensity)
    
    if (!isSpaceshipMode) return null
    
    // Show warning at ~135 units (75% into slowdown zone: 120→140)
    const showWarning = barrierIntensity > 0.75
    
    return (
        <>
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
    )
}
