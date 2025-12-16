import { useMemo } from 'react'
import { skills } from '../../../data/skills'
import './SkillsView.css'

/**
 * SoftSkillsView - Human and interpersonal skills display
 * Filters: Soft Skills, Langues
 */
export const SoftSkillsView = () => {
    // Filter only soft skill categories
    const softCategories = ['Soft Skills', 'Langues']
    const filteredSkills = skills.categories.filter(cat => softCategories.includes(cat.name))

    // Generate random delays once on mount for each skill
    const randomDelays = useMemo(() => {
        const delays = {}
        filteredSkills.forEach(cat => {
            cat.subcategories.forEach(sub => {
                sub.items.forEach(skill => {
                    delays[skill] = Math.random() * 8
                })
            })
        })
        return delays
    }, [])

    return (
        <div className="view-skills">
            {filteredSkills.map((category) => (
                <div key={category.name} className="skills-category">
                    <h3 className="skills-category__title">{category.name}</h3>
                    
                    {category.subcategories.map((sub, idx) => (
                        <div key={idx} className="skills-subcategory">
                            {sub.name && (
                                <h4 className="skills-subcategory__title">{sub.name}</h4>
                            )}
                            <div className="skills-category__tags">
                                {sub.items.map(skill => (
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
