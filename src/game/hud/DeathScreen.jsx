import { useEffect } from 'react'
import { useSpaceshipStore } from '../../stores/spaceshipStore'
import { useAudioStore } from '../../stores/audioStore'
import './DeathScreen.css'

/**
 * DeathScreen - "YOU DIED" overlay in sci-fi style
 * 
 * Appears when isDead is true, displays for 3 seconds before auto-exit
 */
export const DeathScreen = () => {
    const isDead = useSpaceshipStore(state => state.isDead)
    
    // Stop music and play game over sound when death screen appears
    useEffect(() => {
        if (isDead) {
            const audioStore = useAudioStore.getState()
            audioStore.stopAmbient()  // Stop chase music
            audioStore.playGameOver()
        }
    }, [isDead])
    
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
