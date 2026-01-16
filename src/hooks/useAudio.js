import { useCallback } from 'react'
import { useAudioStore } from '../stores/audioStore'

/**
 * useAudio - Hook for playing sound effects
 * 
 * Usage:
 *   const { playClick, playHover, playSFX } = useAudio()
 *   <button onClick={playClick}>Click me</button>
 * 
 * Note: Audio must be initialized first via initAudio() on user interaction
 */
export const useAudio = () => {
    const playSFX = useAudioStore(state => state.playSFX)
    const isMuted = useAudioStore(state => state.isMuted)
    
    // Pre-defined UI sounds
    const playClick = useCallback(() => {
        playSFX('uiClick', 0.6)
    }, [playSFX])
    
    const playHover = useCallback(() => {
        playSFX('uiHover', 0.3)
    }, [playSFX])
    
    const playOpen = useCallback(() => {
        playSFX('uiOpen', 0.5)
    }, [playSFX])
    
    const playClose = useCallback(() => {
        playSFX('uiClose', 0.5)
    }, [playSFX])
    
    // Game sounds
    const playLaser = useCallback(() => {
        playSFX('laser', 0.4)
    }, [playSFX])
    
    const playExplosion = useCallback(() => {
        playSFX('explosion', 0.7)
    }, [playSFX])
    
    const playHit = useCallback(() => {
        playSFX('hit', 0.5)
    }, [playSFX])
    
    return {
        // State
        isMuted,
        
        // UI SFX
        playClick,
        playHover,
        playOpen,
        playClose,
        
        // Game SFX
        playLaser,
        playExplosion,
        playHit,
        
        // Generic
        playSFX,
    }
}
