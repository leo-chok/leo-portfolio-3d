import { useLanguage } from '../context/LanguageContext'
import fr from '../locales/fr.json'
import en from '../locales/en.json'

/**
 * useTranslation - Hook to access translations
 * 
 * Usage:
 *   const { t } = useTranslation()
 *   t('presentation.title') → "Développeur Full-Stack" or "Full-Stack Developer"
 *   t('skills.categories') → array of categories
 */

const translations = { fr, en }

export function useTranslation() {
    const { language } = useLanguage()
    
    /**
     * Get a nested translation by dot-notation key
     * @param {string} key - Dot-notation path like 'presentation.title'
     * @param {any} fallback - Fallback value if key not found
     * @returns {any} - Translation value (string, array, or object)
     */
    const t = (key, fallback = key) => {
        const keys = key.split('.')
        let value = translations[language]
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k]
            } else {
                // Key not found, try French as fallback
                let frValue = translations.fr
                for (const fk of keys) {
                    if (frValue && typeof frValue === 'object' && fk in frValue) {
                        frValue = frValue[fk]
                    } else {
                        return fallback
                    }
                }
                return frValue
            }
        }
        
        return value
    }
    
    /**
     * Get full data object for a section
     * Useful for sections with complex nested data
     */
    const getSection = (section) => {
        return translations[language][section] || translations.fr[section] || {}
    }
    
    return { t, getSection, language }
}
