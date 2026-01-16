import { useAudioStore } from '../../stores/audioStore'
import './AudioToggle.css'

/**
 * AudioToggle - Mute/unmute button for HUD
 * Styled to match CockpitHUD design language
 */
export const AudioToggle = () => {
    const isMuted = useAudioStore(state => state.isMuted)
    const isInitialized = useAudioStore(state => state.isInitialized)
    const toggleMute = useAudioStore(state => state.toggleMute)
    
    // Don't show if audio not initialized
    if (!isInitialized) return null
    
    return (
        <button 
            className={`audio-toggle ${isMuted ? 'audio-toggle--muted' : ''}`}
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
        >
            {isMuted ? (
                <svg viewBox="0 0 24 24" fill="none">
                    {/* Muted icon */}
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" fill="none">
                    {/* Sound on icon */}
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
            )}
        </button>
    )
}
