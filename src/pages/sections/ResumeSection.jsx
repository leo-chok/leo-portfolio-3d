import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useInView } from '../../hooks/useInView'

/**
 * ResumeSection - Base component for resume sections with scroll animations
 * 
 * Features:
 * - Fade in + slide up animation on scroll
 * - Uses native Intersection Observer for reliable mobile detection
 * - Section title with decorative elements
 */
export const ResumeSection = ({ 
    id, 
    title, 
    icon = '◆',
    children,
    className = '' 
}) => {
    const contentRef = useRef(null)
    const [sectionRef, isInView] = useInView({ threshold: 0.1 })
    const hasAnimated = useRef(false)
    
    // Animate when section comes into view
    useEffect(() => {
        const content = contentRef.current
        if (!content) return
        
        if (isInView && !hasAnimated.current) {
            hasAnimated.current = true
            gsap.to(content, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power2.out'
            })
        }
    }, [isInView])
    
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
                
                {/* Content - starts invisible, animates in */}
                <div 
                    ref={contentRef} 
                    className="resume-section__inner"
                    style={{ opacity: 0, transform: 'translateY(60px)' }}
                >
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
