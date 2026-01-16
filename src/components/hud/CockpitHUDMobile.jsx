import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCockpitLogic } from './hooks/useCockpitLogic'
import { useTranslation } from '../../hooks/useTranslation'
import { useLanguage } from '../../context/LanguageContext'
import { useZenModeStore } from '../../stores/zenModeStore'
import { useAudioStore } from '../../stores/audioStore'
import { SuccessModal } from './components'
import './CockpitHUDMobile.css'

/**
 * CockpitHUDMobile - Mobile-optimized HUD overlay
 * 
 * New UX design with:
 * - Burger menu top left with slide-in panel
 * - Bottom bar with navigation arrows + system name + analyze button
 * - Menu contains: systems list, language toggle, zen mode, audio toggle, back to home
 */
export const CockpitHUDMobile = () => {
    const logic = useCockpitLogic()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { language, toggleLanguage } = useLanguage()
    const enterZenMode = useZenModeStore(state => state.enterZenMode)
    const isMuted = useAudioStore(state => state.isMuted)
    const isAudioInitialized = useAudioStore(state => state.isInitialized)
    const toggleMute = useAudioStore(state => state.toggleMute)
    const ui = t('ui')
    
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    
    // Hide HUD in spaceship mode
    if (logic.isSpaceshipMode) return null
    
    const handleBackHome = () => {
        setIsMenuOpen(false)
        navigate('/')
    }
    
    const handleSelectSection = (section) => {
        logic.handleDropdownSelect(section)
        setIsMenuOpen(false)
    }
    
    const handleZenMode = () => {
        setIsMenuOpen(false)
        enterZenMode()
    }
    
    const handleToggleAudio = () => {
        toggleMute()
    }

    return (
        <div className={`hud-mobile ${logic.isVisible ? 'hud-mobile--visible' : ''}`}>
            
            {/* === TOP BAR === */}
            <div className="hud-mobile__top">
                {/* Burger Menu Button */}
                <button 
                    className={`hud-mobile__burger ${isMenuOpen ? 'hud-mobile__burger--open' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Menu"
                >
                    <span className="hud-mobile__burger-line" />
                    <span className="hud-mobile__burger-line" />
                    <span className="hud-mobile__burger-line" />
                </button>
                
                {/* Progress indicator */}
                <div className="hud-mobile__progress">
                    <span className="hud-mobile__progress-label">{ui.discoveries || 'DÉCOUVERTES'}</span>
                    <span className="hud-mobile__progress-current">{logic.analyzedCount}</span>
                    <span className="hud-mobile__progress-sep">/</span>
                    <span className="hud-mobile__progress-total">{logic.totalAnalyzable}</span>
                </div>
            </div>
            
            {/* === BOTTOM BAR === */}
            <div className="hud-mobile__bottom">
                {/* Analyze Button - Above nav */}
                {logic.showAnalyzeButton && (
                    <button 
                        className={`hud-mobile__analyze ${logic.isLoading ? 'hud-mobile__analyze--loading' : ''}`}
                        onClick={logic.handleAnalyze}
                        disabled={logic.isLoading}
                    >
                        {logic.isLoading ? (
                            <>
                                <span className="hud-mobile__analyze-progress" 
                                    style={{ width: `${logic.loadingProgress * 100}%` }} 
                                />
                                <span className="hud-mobile__analyze-text">
                                    {ui.decrypting || 'DÉCRYPTAGE...'} {Math.round(logic.loadingProgress * 100)}%
                                </span>
                            </>
                        ) : logic.analyzedSections.has(logic.trackedId) ? (
                            <span className="hud-mobile__analyze-text">
                                {logic.sectionHasWindow ? (ui.alreadyOpened || 'DÉJÀ OUVERT') : (ui.openData || 'OUVRIR')}
                            </span>
                        ) : (
                            <span className="hud-mobile__analyze-text">{ui.analyze || 'ANALYSER'}</span>
                        )}
                    </button>
                )}
                
                {/* Navigation Row */}
                <div className="hud-mobile__nav-row">
                    <button 
                        className="hud-mobile__nav-btn"
                        onClick={logic.navigatePrev}
                        aria-label={ui.previousSection}
                    >
                        ◁
                    </button>
                    
                    <div className="hud-mobile__system-info">
                        <span className="hud-mobile__system-title">{logic.displayTitle}</span>
                    </div>
                    
                    <button 
                        className="hud-mobile__nav-btn"
                        onClick={logic.navigateNext}
                        aria-label={ui.nextSection}
                    >
                        ▷
                    </button>
                </div>
            </div>
            
            {/* === SLIDE-IN MENU === */}
            <div className={`hud-mobile__menu ${isMenuOpen ? 'hud-mobile__menu--open' : ''}`}>
                {/* Menu Header */}
                <div className="hud-mobile__menu-header">
                    <span className="hud-mobile__menu-title">{ui.nav || 'NAV'}</span>
                    <button 
                        className="hud-mobile__menu-close"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        ✕
                    </button>
                </div>
                
                {/* Systems List */}
                <div className="hud-mobile__menu-systems">
                    {logic.sections.map((section, index) => {
                        const isSectionAnalyzed = section.isOverview || logic.analyzedSections.has(section.id)
                        const isActive = section.id === logic.activeSection
                        return (
                            <button
                                key={section.id}
                                className={`hud-mobile__menu-item ${isActive ? 'hud-mobile__menu-item--active' : ''}`}
                                onClick={() => handleSelectSection(section)}
                            >
                                <span className="hud-mobile__menu-index">
                                    {String(index).padStart(2, '0')}
                                </span>
                                <span className={`hud-mobile__menu-name ${!isSectionAnalyzed ? 'hud-mobile__menu-name--encrypted' : ''}`}>
                                    {isSectionAnalyzed ? section.name : '???'}
                                </span>
                                {isActive && <span className="hud-mobile__menu-indicator">●</span>}
                            </button>
                        )
                    })}
                </div>
                
                {/* Divider */}
                <div className="hud-mobile__menu-divider" />
                
                {/* Language Toggle */}
                <button 
                    className="hud-mobile__menu-lang"
                    onClick={toggleLanguage}
                >
                    <span className="hud-mobile__menu-lang-label">🌐 {ui.lang || 'LANGUE'}</span>
                    <span className="hud-mobile__menu-lang-options">
                        <span className={language === 'fr' ? 'active' : ''}>FR</span>
                        <span>/</span>
                        <span className={language === 'en' ? 'active' : ''}>EN</span>
                    </span>
                </button>
                
                {/* Zen Mode */}
                <button 
                    className="hud-mobile__menu-zen"
                    onClick={handleZenMode}
                >
                    <span className="hud-mobile__menu-zen-icon">☀</span>
                    <span className="hud-mobile__menu-zen-text">{ui.zenMode || 'MODE ZEN'}</span>
                </button>
                
                {/* Audio Toggle */}
                {isAudioInitialized && (
                    <button 
                        className="hud-mobile__menu-audio"
                        onClick={handleToggleAudio}
                    >
                        <span className="hud-mobile__menu-audio-icon">{isMuted ? '🔇' : '🔊'}</span>
                        <span className="hud-mobile__menu-audio-text">{isMuted ? (ui.unmute || 'ACTIVER SON') : (ui.mute || 'COUPER SON')}</span>
                    </button>
                )}
                
                {/* Divider */}
                <div className="hud-mobile__menu-divider" />
                
                {/* Back to Home */}
                <button 
                    className="hud-mobile__menu-home"
                    onClick={handleBackHome}
                >
                    <span className="hud-mobile__menu-home-icon">←</span>
                    <span className="hud-mobile__menu-home-text">{ui.backToHome || 'RETOUR ACCUEIL'}</span>
                </button>
            </div>
            
            {/* Menu Overlay */}
            {isMenuOpen && (
                <div 
                    className="hud-mobile__overlay"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
            
            {/* Corner brackets */}
            <div className="hud-mobile__bracket hud-mobile__bracket--tl" />
            <div className="hud-mobile__bracket hud-mobile__bracket--tr" />
            <div className="hud-mobile__bracket hud-mobile__bracket--bl" />
            <div className="hud-mobile__bracket hud-mobile__bracket--br" />
            
            {/* Success Modal */}
            <SuccessModal 
                isOpen={logic.showSuccessModal} 
                onClose={logic.closeSuccessModal}
                onLaunchSpaceship={logic.enterSpaceshipMode}
            />
        </div>
    )
}
