import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useInView } from '../../hooks/useInView'
import { ResumeSection } from './ResumeSection'
import { skills } from '../../data/skills'
import './ResumeSkills.css'

/**
 * ResumeSkills - Skills section with animated categories
 * 
 * Features:
 * - Categories displayed as cards
 * - Items with staggered reveal on scroll
 * - Uses Intersection Observer for reliable mobile detection
 */
export const ResumeSkills = () => {
    const gridRef = useRef(null)
    const [observerRef, isInView] = useInView({ threshold: 0.1 })
    const hasAnimated = useRef(false)
    
    useEffect(() => {
        const cards = gridRef.current?.querySelectorAll('.skills__card')
        if (!cards?.length) return
        
        if (isInView && !hasAnimated.current) {
            hasAnimated.current = true
            gsap.to(cards, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out'
            })
        }
    }, [isInView])
    
    // Separate soft skills from technical skills
    const technicalCategories = skills.categories.filter(cat => cat.name !== 'Soft Skills')
    const softSkillsCategory = skills.categories.find(cat => cat.name === 'Soft Skills')
    
    return (
        <ResumeSection id="skills" title="Compétences" icon="◈">
            <div className="skills" ref={(el) => { gridRef.current = el; observerRef.current = el }}>
                {/* Technical Skills Grid */}
                <div className="skills__grid">
                    {technicalCategories.map((category, idx) => (
                        <div 
                            key={idx} 
                            className="skills__card"
                            style={{ opacity: 0, transform: 'translateY(40px) scale(0.95)' }}
                        >
                            <h3 className="skills__card-title">{category.name}</h3>
                            <div className="skills__subcategories">
                                {category.subcategories.map((sub, subIdx) => (
                                    <div key={subIdx} className="skills__subcategory">
                                        {sub.name && (
                                            <h4 className="skills__subcategory-title">{sub.name}</h4>
                                        )}
                                        <div className="skills__items">
                                            {sub.items.map((item, itemIdx) => (
                                                <span key={itemIdx} className="skills__item">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Soft Skills - Special display */}
                {softSkillsCategory && (
                    <div className="skills__soft">
                        <h3 className="skills__soft-title">Soft Skills</h3>
                        <div className="skills__soft-items">
                            {softSkillsCategory.subcategories[0].items.map((item, idx) => (
                                <span key={idx} className="skills__soft-item">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ResumeSection>
    )
}
