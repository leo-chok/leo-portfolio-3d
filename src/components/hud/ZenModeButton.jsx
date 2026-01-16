import { useZenModeStore } from '../../stores/zenModeStore'
import './ZenModeButton.css'

/**
 * ZenModeButton - Floating button to enter zen/screensaver mode
 * Styled to match CockpitHUD design language
 */
export const ZenModeButton = () => {
    const enterZenMode = useZenModeStore(state => state.enterZenMode)
    const isZenMode = useZenModeStore(state => state.isZenMode)
    
    // Hide button when already in zen mode
    if (isZenMode) return null
    
    return (
        <button 
            className="zen-mode-button"
            onClick={enterZenMode}
            title="Enter Zen Mode"
        >
            <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
            <span>ZEN</span>
        </button>
    )
}

