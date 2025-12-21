import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ResumeSection } from './ResumeSection'
import { skills } from '../../data/skills'
import './ResumeSkills.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * ResumeSkills - Skills section with animated categories
 * 
 * Features:
 * - Categories displayed as cards
 * - Items with staggered reveal on scroll
 * - Soft skills separated visually
 */
export const ResumeSkills = () => {
    const gridRef = useRef(null)
    
    useEffect(() => {
        const cards = gridRef.current?.querySelectorAll('.skills__card')
        if (!cards?.length) return
        
        gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 })
        
        ScrollTrigger.create({
            trigger: gridRef.current,
            start: 'top 75%',
            onEnter: () => {
                gsap.to(cards, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power2.out'
                })
            }
        })
        
        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill())
        }
    }, [])
    
    // Separate soft skills from technical skills
    const technicalCategories = skills.categories.filter(cat => cat.name !== 'Soft Skills')
    const softSkillsCategory = skills.categories.find(cat => cat.name === 'Soft Skills')
    
    return (
        <ResumeSection id="skills" title="Compétences" icon="◈">
            <div className="skills" ref={gridRef}>
                {/* Technical Skills Grid */}
                <div className="skills__grid">
                    {technicalCategories.map((category, idx) => (
                        <div key={idx} className="skills__card">
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
