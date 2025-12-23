import { useRef } from 'react'
import './FloatingIdentity.css'

/**
 * FloatingIdentity - Floating Identity Card Component
 * 
 * Features:
 * - Fixed position on left side (desktop only)
 * - HoloWindow glassmorphism style
 * - Holographic portrait with scan effect
 * - Contact button
 * - Levitation animation
 */
export const FloatingIdentity = () => {
    const cardRef = useRef(null)
    
    const scrollToHero = () => {
        document.querySelector('.hero')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        })
    }
    
    const scrollToContact = () => {
        const contactSection = document.getElementById('contact')
        contactSection?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        })
    }
    
    return (
        <aside className="floating-identity" ref={cardRef}>
            {/* Corner brackets */}
            <div className="floating-identity__bracket floating-identity__bracket--tl" />
            <div className="floating-identity__bracket floating-identity__bracket--tr" />
            <div className="floating-identity__bracket floating-identity__bracket--bl" />
            <div className="floating-identity__bracket floating-identity__bracket--br" />
            
            {/* Scanlines */}
            <div className="floating-identity__scanlines" />
            
            {/* Portrait Section */}
            <button 
                className="floating-identity__portrait"
                onClick={scrollToHero}
                title="Retour en haut"
            >
                <div className="floating-identity__portrait-holo" />
                <div className="floating-identity__portrait-frame">
                    <img 
                        src="/portrait.PNG" 
                        alt="Léo Stalhberger" 
                        className="floating-identity__portrait-img"
                    />
                    <div className="floating-identity__portrait-scan" />
                </div>
                <div className="floating-identity__portrait-label">IDENTITY SCAN</div>
            </button>
            
            {/* Contact Button */}
            <button 
                className="floating-identity__contact"
                onClick={scrollToContact}
            >
                <span className="floating-identity__contact-shimmer" />
                <span className="floating-identity__contact-icon">✉</span>
                <span className="floating-identity__contact-text">CONTACT</span>
            </button>
        </aside>
    )
}
