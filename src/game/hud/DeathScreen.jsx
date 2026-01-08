import { useSpaceshipStore } from '../../stores/spaceshipStore'
import './DeathScreen.css'

/**
 * DeathScreen - "YOU DIED" overlay in sci-fi style
 * 
 * Appears when isDead is true, displays for 3 seconds before auto-exit
 */
export const DeathScreen = () => {
    const isDead = useSpaceshipStore(state => state.isDead)
    
    if (!isDead) return null
    
    return (
        <div className="death-screen">
            <div className="death-screen__content">
                <div className="death-screen__glitch" data-text="YOU DIED">
                    YOU DIED
                </div>
            </div>
        </div>
    )
}
