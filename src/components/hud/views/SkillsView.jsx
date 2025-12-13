import { presentation } from '../../../data/presentation'
import './SkillsView.css'

/**
 * SkillsView - Skills display organized by categories
 * Uses skills data from presentation.js
 */
export const SkillsView = () => {
    const { skills } = presentation
    
    return (
        <div className="view-skills">
            {Object.entries(skills).map(([category, items]) => (
                <div key={category} className="skills-category">
                    <h4 className="skills-category__title">{category}</h4>
                    <div className="skills-category__tags">
                        {items.map(skill => (
                            <span key={skill} className="skills-tag">{skill}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
