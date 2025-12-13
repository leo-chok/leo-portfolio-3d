import { presentation } from '../../../data/presentation'
import './FormationView.css'

/**
 * FormationView - Education and Experience display
 * Uses experience data from presentation.js
 */
export const FormationView = () => {
    const { experience } = presentation
    
    return (
        <div className="view-formation">
            <div className="formation-timeline">
                {experience.map((exp, index) => (
                    <div key={index} className="formation-item">
                        <div className="formation-item__marker">
                            <span className="formation-item__dot" />
                            {index < experience.length - 1 && <span className="formation-item__line" />}
                        </div>
                        
                        <div className="formation-item__content">
                            <div className="formation-item__header">
                                <h4 className="formation-item__title">{exp.title}</h4>
                                <span className="formation-item__type">{exp.type}</span>
                            </div>
                            
                            <div className="formation-item__company">{exp.company}</div>
                            <div className="formation-item__period">{exp.period}</div>
                            
                            {exp.highlights && (
                                <ul className="formation-item__highlights">
                                    {exp.highlights.map((highlight, i) => (
                                        <li key={i}>{highlight}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
