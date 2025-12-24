import { useTranslation } from '../../../hooks/useTranslation'
import './PresentationView.css'

/**
 * PresentationView - Personal introduction display
 * Uses translations from useTranslation hook
 */
export const PresentationView = () => {
    const { t } = useTranslation()
    
    const presentation = t('presentation')
    const { name, title, subtitle, status, about, stats, labels } = presentation
    
    return (
        <div className="view-presentation">
            {/* Portrait Photo */}
            <div className="view-presentation__photo">
                <div className="view-presentation__photo-frame">
                    <img 
                        src="/portrait.PNG" 
                        alt={name}
                        className="view-presentation__photo-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <div className="view-presentation__photo-label">{labels?.identityScan || 'IDENTITY SCAN'}</div>
            </div>
            
            {/* Text Content */}
            <div className="view-presentation__text">
                <h3 className="view-presentation__subtitle">{title} {subtitle}</h3>
                
                <div className="view-presentation__bio">
                    {about?.map((paragraph, index) => (
                        <p 
                            key={index} 
                            className={`view-presentation__paragraph view-presentation__paragraph--${paragraph.type}`}
                            dangerouslySetInnerHTML={{ __html: paragraph.text }}
                        />
                    ))}
                </div>
                
                {/* Status Badge */}
                <div className="view-presentation__status">
                    <span className="view-presentation__status-badge">
                        🎓 {status?.text} - {status?.school}
                    </span>
                </div>
                
                {/* Stats */}
                <div className="view-presentation__stats">
                    <div className="view-presentation__stat">
                        <span className="view-presentation__stat-label">{labels?.experience || 'EXPERIENCE'}</span>
                        <span className="view-presentation__stat-value">{stats?.experience || '2 YEARS'}</span>
                    </div>
                    <div className="view-presentation__stat">
                        <span className="view-presentation__stat-label">{labels?.specialty || 'SPECIALTY'}</span>
                        <span className="view-presentation__stat-value">{stats?.specialty || 'FULL-STACK'}</span>
                    </div>
                    <div className="view-presentation__stat">
                        <span className="view-presentation__stat-label">{labels?.status || 'STATUS'}</span>
                        <span className="view-presentation__stat-value view-presentation__stat-value--active">{stats?.status || 'EMPLOYED'}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

