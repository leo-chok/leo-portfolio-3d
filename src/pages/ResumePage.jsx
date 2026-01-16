import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useAudioStore } from '../stores/audioStore'

// Sections
import { ResumeHero } from './sections/ResumeHero'
import { ResumeSkills } from './sections/ResumeSkills'
import { ResumeFormations } from './sections/ResumeFormations'
import { ResumeProjects } from './sections/ResumeProjects'
import { ResumeContact } from './sections/ResumeContact'

// Components
import { FloatingIdentity } from './components/FloatingIdentity'

// Styles
import './ResumePage.css'
import './sections/ResumeSection.css'

/**
 * ResumePage - Scrollable CV page with all sections
 * 
 * Features:
 * - All portfolio sections in a scrollable format
 * - Scroll animations using native Intersection Observer
 * - Floating nav button to 3D experience
 * - Floating identity card with portrait and contact
 */
export const ResumePage = () => {
    const navigate = useNavigate()
    const { language, toggleLanguage } = useLanguage()
    
    // Start ambient music when page loads
    useEffect(() => {
        const startAmbient = async () => {
            const audioStore = useAudioStore.getState()
            if (audioStore.isInitialized && !audioStore.isAmbientPlaying) {
                // Wait for buffer to load if not ready
                await audioStore.loadAmbient('space')
                audioStore.playAmbient('space')
            }
        }
        startAmbient()
    }, [])
    
    const handleExperienceClick = () => {
        navigate('/experience')
    }
    
    return (
        <div className="resume">
            <div className="resume__bg">
                <div className="resume__grid" />
                <div className="resume__scanlines" />
            </div>
            
            
            {/* Back to home - Fixed orange sci-fi button */}
            <button 
                className="resume__home-btn"
                onClick={() => navigate('/')}
                title="Retour à l'accueil"
            >
                <svg className="resume__home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 14L4 9l5-5"/>
                    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>
                </svg>
            </button>
            
            {/* Language toggle - Fixed blue sci-fi button */}
            <button 
                className="resume__lang-btn"
                onClick={toggleLanguage}
                title={language === 'fr' ? 'Switch to English' : 'Passer en Français'}
            >
                <span className="resume__lang-text">{language === 'fr' ? 'EN' : 'FR'}</span>
            </button>
            
            {/* Content wrapper */}
            <div className="resume__wrapper">
                {/* Hero Section with Floating Identity */}
                <div className="resume__hero-wrapper">
                    <FloatingIdentity />
                    <ResumeHero />
                </div>
                <ResumeSkills />
                <ResumeFormations />
                <ResumeProjects />
                <ResumeContact />
                
                {/* Footer */}
                <footer className="resume__footer">
                    <div className="resume__footer-line" />
                    <span className="resume__footer-text">
                        © {new Date().getFullYear()} Léo Stalhberger
                    </span>
                    <div className="resume__footer-line" />
                </footer>
            </div>
        </div>
    )
}
