import { useTranslation } from '../../../hooks/useTranslation'
import './FormationView.css'

/**
 * FormationView - Education display with timeline graduation
 * Uses translations from useTranslation hook
 */
export const FormationView = () => {
    const { t } = useTranslation()
    const formations = t('formations')
    
    return (
        <div className="view-formation">
            {/* Timeline graduation ruler on the left */}
            <div className="formation-ruler">
                {formations.items?.map((_, index) => (
                    <div key={index} className="formation-ruler__section">
                        <span className="formation-ruler__major" />
                        <div className="formation-ruler__minors">
                            <span /><span /><span /><span /><span />
                        </div>
                    </div>
                ))}
            </div>

            <div className="formation-timeline">
                {formations.items?.map((item, index) => (
                    <div key={index} className="formation-item">
                        <div className="formation-item__marker">
                            <span className="formation-item__dot" />
                            {index < formations.items.length - 1 && <span className="formation-item__line" />}
                        </div>
                        
                        <div className="formation-item__content">
                            <div className="formation-item__header">
                                <h4 className="formation-item__title">{item.title}</h4>
                                {item.subtitle && (
                                    <span className="formation-item__subtitle">{item.subtitle}</span>
                                )}
                            </div>
                            
                            <div className="formation-item__school">{item.school}</div>
                            <div className="formation-item__period">{item.period}</div>
                            
                            <p className="formation-item__description">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

