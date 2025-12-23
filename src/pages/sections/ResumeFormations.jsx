import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useInView } from '../../hooks/useInView'
import { ResumeSection } from './ResumeSection'
import { formations } from '../../data/formations'
import './ResumeFormations.css'

/**
 * ResumeFormations - Timeline section for education
 * 
 * Features:
 * - Vertical timeline with connecting line
 * - Cards alternating left/right on desktop
 * - Uses Intersection Observer for reliable mobile detection
 */
export const ResumeFormations = () => {
    const timelineRef = useRef(null)
    const [observerRef, isInView] = useInView({ threshold: 0.1 })
    const hasAnimated = useRef(false)
    
    useEffect(() => {
        const items = timelineRef.current?.querySelectorAll('.formations__item')
        const line = timelineRef.current?.querySelector('.formations__line-fill')
        
        if (!items?.length) return
        
        if (isInView && !hasAnimated.current) {
            hasAnimated.current = true
            
            // Animate line first
            gsap.to(line, {
                scaleY: 1,
                duration: 1.2,
                ease: 'power2.out'
            })
            
            // Then items with stagger
            gsap.to(items, {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.2,
                ease: 'power2.out',
                delay: 0.3
            })
        }
    }, [isInView])
    
    return (
        <ResumeSection id="formations" title="Formations" icon="◈">
            <div 
                className="formations" 
                ref={(el) => { timelineRef.current = el; observerRef.current = el }}
            >
                {/* Vertical line */}
                <div className="formations__line">
                    <div 
                        className="formations__line-fill" 
                        style={{ transform: 'scaleY(0)', transformOrigin: 'top' }}
                    />
                </div>
                
                {/* Timeline items */}
                <div className="formations__items">
                    {formations.items.map((formation, idx) => (
                        <div 
                            key={idx} 
                            className={`formations__item ${idx % 2 === 0 ? 'formations__item--left' : 'formations__item--right'}`}
                            style={{ 
                                opacity: 0, 
                                transform: `translateX(${idx % 2 === 0 ? '-50px' : '50px'})` 
                            }}
                        >
                            {/* Dot on timeline */}
                            <div className="formations__dot" />
                            
                            {/* Card */}
                            <div className="formations__card">
                                <div className="formations__period">{formation.period}</div>
                                <h3 className="formations__title">{formation.title}</h3>
                                {formation.subtitle && (
                                    <div className="formations__subtitle">{formation.subtitle}</div>
                                )}
                                <div className="formations__school">{formation.school}</div>
                                <p className="formations__desc">{formation.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ResumeSection>
    )
}
