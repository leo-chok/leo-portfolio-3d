import { useLanguage } from '../../../context/LanguageContext'
import { useAudioStore } from '../../../stores/audioStore'
import './LanguageToggle.css'

/**
 * LanguageToggle - FR/EN language switch
 * Styled like other TopBar info items: LANG FR/EN
 */
export const LanguageToggle = () => {
    const { language, toggleLanguage } = useLanguage()
    
    const handleClick = async () => {
        const audioStore = useAudioStore.getState()
        
        // Initialize audio if first interaction
        if (!audioStore.isInitialized) {
            await audioStore.initAudio()
            // Wait for buffer to load, then play sound
            setTimeout(() => {
                useAudioStore.getState().playClick()
            }, 200)
        } else {
            audioStore.playClick()
        }
        
        toggleLanguage()
    }
    
    return (
        <button 
            className="language-toggle"
            onClick={handleClick}
            aria-label={`Switch to ${language === 'fr' ? 'English' : 'Français'}`}
        >
            <span className="language-toggle__label">LANG</span>
            <span className={`language-toggle__option ${language === 'fr' ? 'active' : ''}`}>
                FR
            </span>
            <span className="language-toggle__separator">/</span>
            <span className={`language-toggle__option ${language === 'en' ? 'active' : ''}`}>
                EN
            </span>
        </button>
    )
}
