import { useSpaceshipStore } from '../../stores/spaceshipStore'
import './SpaceshipControls.css'

/**
 * SpaceshipControls - Minimal sci-fi control hints overlay
 * Shows when spaceship mode is active
 */
export const SpaceshipControls = () => {
    const isSpaceshipMode = useSpaceshipStore(state => state.isSpaceshipMode)
    
    if (!isSpaceshipMode) return null
    
    return (
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
    )
}
