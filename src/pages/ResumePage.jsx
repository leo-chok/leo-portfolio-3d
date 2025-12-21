import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Sections
import { ResumeHero } from './sections/ResumeHero'
import { ResumeSkills } from './sections/ResumeSkills'
import { ResumeFormations } from './sections/ResumeFormations'
import { ResumeProjects } from './sections/ResumeProjects'
import { ResumeContact } from './sections/ResumeContact'

// Styles
import './ResumePage.css'
import './sections/ResumeSection.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * ResumePage - Scrollable CV page with all sections
 * 
 * Features:
 * - All portfolio sections in a scrollable format
 * - GSAP ScrollTrigger animations
 * - Floating nav button to 3D experience
 */
export const ResumePage = () => {
    const navigate = useNavigate()
    
    // Cleanup ScrollTrigger on unmount
    useEffect(() => {
        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill())
        }
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
            
            {/* Floating nav button */}
            <button 
                className="resume__nav-float"
                onClick={handleExperienceClick}
                title="Voir l'expérience 3D"
            >
                <span className="resume__nav-icon">◇</span>
                <span className="resume__nav-label">Expérience 3D</span>
            </button>
            
            {/* Back to welcome */}
            <button 
                className="resume__nav-back"
                onClick={() => navigate('/')}
                title="Retour à l'accueil"
            >
                ← Accueil
            </button>
            
            {/* Content wrapper */}
            <div className="resume__wrapper">
                <ResumeHero />
                <ResumeSkills />
                <ResumeFormations />
                <ResumeProjects />
                <ResumeContact />
                
                {/* Footer */}
                <footer className="resume__footer">
                    <div className="resume__footer-line" />
                    <span className="resume__footer-text">
                        © {new Date().getFullYear()} Léo Stalhberger — Portfolio STAL-117
                    </span>
                    <div className="resume__footer-line" />
                </footer>
            </div>
        </div>
    )
}
