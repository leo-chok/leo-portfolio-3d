import { createContext, useContext, useState, useEffect } from 'react'

/**
 * LanguageContext - Manages application language state
 * Supports 'fr' (French) and 'en' (English)
 * Persists language choice in localStorage
 */

const LanguageContext = createContext()

const STORAGE_KEY = 'portfolio-language'
const DEFAULT_LANGUAGE = 'fr'
const SUPPORTED_LANGUAGES = ['fr', 'en']

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(() => {
        // Try to get saved language from localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
                return saved
            }
            // Detect browser language as fallback
            const browserLang = navigator.language.split('-')[0]
            if (SUPPORTED_LANGUAGES.includes(browserLang)) {
                return browserLang
            }
        }
        return DEFAULT_LANGUAGE
    })

    // Persist language choice to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, language)
        // Update HTML lang attribute for SEO
        document.documentElement.lang = language
    }, [language])

    const setLanguage = (lang) => {
        if (SUPPORTED_LANGUAGES.includes(lang)) {
            setLanguageState(lang)
        }
    }

    const toggleLanguage = () => {
        setLanguageState(prev => prev === 'fr' ? 'en' : 'fr')
    }

    const value = {
        language,
        setLanguage,
        toggleLanguage,
        isEnglish: language === 'en',
        isFrench: language === 'fr'
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
