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
        
        // Scroll-triggered animation
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'top 50%',
                toggleActions: 'play none none reverse'
            }
        })
        
        tl.to(content, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out'
        })
        
        return () => {
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger === section) {
                    trigger.kill()
                }
            })
        }
    }, [])
    
    return (
        <section 
            id={id}
            ref={sectionRef}
            className={`resume-section ${className}`}
        >
            <div ref={contentRef} className="resume-section__inner">
                {title && (
                    <header className="resume-section__header">
                        <div className="resume-section__line" />
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
        </section>
    )
}
