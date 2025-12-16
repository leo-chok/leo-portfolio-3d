import { presentation } from '../../../data/presentation'
import './PresentationView.css'

/**
 * PresentationView - Personal introduction display
 * Uses data from presentation.js for clean architecture
 */
export const PresentationView = () => {
    const { name, title, subtitle, tagline, status, about } = presentation
    
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
                <div className="view-presentation__photo-label">IDENTITY SCAN</div>
            </div>
            
            {/* Text Content */}
            <div className="view-presentation__text">
                <h3 className="view-presentation__subtitle">{title} {subtitle}</h3>
                
                <div className="view-presentation__bio">
                    {about.map((paragraph, index) => (
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
                        🎓 {status.text} - {status.school}
                    </span>
                </div>
                

                
                {/* Stats */}
                <div className="view-presentation__stats">
                    <div className="view-presentation__stat">
                        <span className="view-presentation__stat-label">EXPERIENCE</span>
                        <span className="view-presentation__stat-value">2 YEARS</span>
                    </div>
                    <div className="view-presentation__stat">
                        <span className="view-presentation__stat-label">SPECIALTY</span>
                        <span className="view-presentation__stat-value">FULL-STACK</span>
                    </div>
                    <div className="view-presentation__stat">
                        <span className="view-presentation__stat-label">STATUS</span>
                        <span className="view-presentation__stat-value view-presentation__stat-value--active">EN POSTE</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
