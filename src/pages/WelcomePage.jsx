import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import './WelcomePage.css'

/**
 * WelcomePage - Landing page with choice between Resume and 3D Experience
 * 
 * Features:
 * - Sci-fi themed design matching the portfolio aesthetic
 * - Two CTA buttons with descriptive subtitles
 * - Animated background with grid lines
 * - Entry animations
 */
export const WelcomePage = () => {
    const navigate = useNavigate()
    const containerRef = useRef(null)
    
    // Entry animation
    useEffect(() => {
        const container = containerRef.current
        if (container) {
            container.classList.add('welcome--visible')
        }
    }, [])
    
    const handleResumeClick = () => {
        navigate('/resume')
    }
    
    const handleExperienceClick = () => {
        navigate('/experience')
    }
    
    return (
        <div className="welcome" ref={containerRef}>
            {/* Animated background */}
            <div className="welcome__bg">
                <div className="welcome__grid" />
                <div className="welcome__scanlines" />
                <div className="welcome__grain" />
                <div className="welcome__flicker" />
                <div className="welcome__chromatic" />
                <div className="welcome__vignette" />
            </div>
            
            {/* Corner brackets */}
            <div className="welcome__bracket welcome__bracket--tl" />
            <div className="welcome__bracket welcome__bracket--tr" />
            <div className="welcome__bracket welcome__bracket--bl" />
            <div className="welcome__bracket welcome__bracket--br" />
            
            {/* Main content */}
            <div className="welcome__content">
                {/* Header */}
                <header className="welcome__header">
                    <div className="welcome__ship-id">
                        <span className="welcome__ship-prefix">VAISSEAU</span>
                        <span className="welcome__ship-name">STAL-117</span>
                    </div>
                    <h1 className="welcome__title">
                        <span className="welcome__title-line">BIENVENUE</span>
                        <span className="welcome__title-line welcome__title-line--sub">À BORD</span>
                    </h1>
                    <p className="welcome__subtitle">
                        Portfolio de <strong>Léo Stalhberger</strong> — Développeur Full-Stack & Créateur 3D
                    </p>
                </header>
                
                {/* CTA Buttons */}
                <div className="welcome__ctas">
                    <button 
                        className="welcome__cta welcome__cta--resume"
                        onClick={handleResumeClick}
                    >
                        <span className="welcome__cta-shimmer" />
                        <span className="welcome__cta-icon">◇</span>
                        <span className="welcome__cta-content">
                            <span className="welcome__cta-label">VOIR LE RÉSUMÉ</span>
                            <span className="welcome__cta-desc">CV interactif • Lecture ~3 min</span>
                        </span>
                    </button>
                    
                    <button 
                        className="welcome__cta welcome__cta--experience"
                        onClick={handleExperienceClick}
                    >
                        <span className="welcome__cta-shimmer" />
                        <span className="welcome__cta-icon">◈</span>
                        <span className="welcome__cta-content">
                            <span className="welcome__cta-label">EXPÉRIENCE 3D</span>
                            <span className="welcome__cta-desc">Exploration immersive</span>
                        </span>
                    </button>
                </div>
                
                {/* Footer */}
                <footer className="welcome__footer">
                    <div className="welcome__footer-line" />
                    <span className="welcome__footer-text">STELLAR NAVIGATION SYSTEM v3.0</span>
                    <div className="welcome__footer-line" />
                </footer>
            </div>
        </div>
    )
}
