import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

/**
 * ResumeSection - Base component for resume sections with scroll animations
 * 
 * Features:
 * - Fade in + slide up animation on scroll
 * - Section title with decorative elements
 * - Configurable animation settings
 */
export const ResumeSection = ({ 
    id, 
    title, 
    icon = '◆',
    children,
    className = '' 
}) => {
    const sectionRef = useRef(null)
    const contentRef = useRef(null)
    
    useEffect(() => {
        const section = sectionRef.current
        const content = contentRef.current
        
        if (!section || !content) return
        
        // Initial state
        gsap.set(content, { 
            opacity: 0, 
            y: 60 
        })
        
        // Scroll-triggered animation - use once: true for mobile reliability
        const trigger = ScrollTrigger.create({
            trigger: section,
            start: 'top 85%',
            once: true, // Play only once, more reliable on mobile
            onEnter: () => {
                gsap.to(content, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power2.out'
                })
            }
        })
        
        // Refresh after a short delay to ensure correct position calculation on mobile
        const refreshTimeout = setTimeout(() => {
            ScrollTrigger.refresh()
        }, 100)
        
        return () => {
            clearTimeout(refreshTimeout)
            trigger.kill()
        }
    }, [])
    
    return (
        <section 
            id={id}
            ref={sectionRef}
            className={`resume-section ${className}`}
        >
            <div className="resume-section__panel">
                {/* Corner brackets */}
                <div className="resume-section__bracket resume-section__bracket--tl" />
                <div className="resume-section__bracket resume-section__bracket--tr" />
                <div className="resume-section__bracket resume-section__bracket--bl" />
                <div className="resume-section__bracket resume-section__bracket--br" />
                
                {/* Scanlines overlay */}
                <div className="resume-section__scanlines" />
                
                {/* Content */}
                <div ref={contentRef} className="resume-section__inner">
                    {title && (
                        <header className="resume-section__header">
                            <div className="resume-section__title-wrapper">
                                <span className="resume-section__icon">{icon}</span>
                                <h2 className="resume-section__title">{title}</h2>
                            </div>
                            <div className="resume-section__line" />
                        </header>
                    )}
                    <div className="resume-section__content">
                        {children}
                    </div>
                </div>
            </div>
        </section>
    )
}
