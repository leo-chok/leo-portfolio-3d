import { useMemo } from 'react'
import { useTranslation } from '../../../hooks/useTranslation'
import './SkillsView.css'

/**
 * SkillsView - Skills display organized by categories and subcategories
 * Uses translations from useTranslation hook
 * Each tag gets a random shimmer delay for natural animation
 */
export const SkillsView = () => {
    const { t } = useTranslation()
    const skills = t('skills')
    
    // Generate random delays once on mount for each skill
    const randomDelays = useMemo(() => {
        const delays = {}
        skills.categories?.forEach(cat => {
            cat.subcategories?.forEach(sub => {
                sub.items?.forEach(skill => {
                    // Random delay between 0 and 8 seconds
                    delays[skill] = Math.random() * 8
                })
            })
        })
        return delays
    }, [skills])

    return (
        <div className="view-skills">
            {skills.categories?.map((category) => (
                <div key={category.name} className="skills-category">
                    <h3 className="skills-category__title">{category.name}</h3>
                    
                    {category.subcategories?.map((sub, idx) => (
                        <div key={idx} className="skills-subcategory">
                            {sub.name && (
                                <h4 className="skills-subcategory__title">{sub.name}</h4>
                            )}
                            <div className="skills-category__tags">
                                {sub.items?.map(skill => (
                                    <span 
                                        key={skill} 
                                        className="skills-tag"
                                        style={{ '--shimmer-delay': `${randomDelays[skill]}s` }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

