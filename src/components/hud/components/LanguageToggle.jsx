import { useLanguage } from '../../../context/LanguageContext'
import './LanguageToggle.css'

/**
 * LanguageToggle - FR/EN language switch
 * Styled like other TopBar info items: LANG FR/EN
 */
export const LanguageToggle = () => {
    const { language, toggleLanguage } = useLanguage()
    
    return (
        <button 
            className="language-toggle"
            onClick={toggleLanguage}
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
