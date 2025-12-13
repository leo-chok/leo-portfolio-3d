import { presentation } from '../../../data/presentation'
import './PresentationView.css'

/**
 * PresentationView - Personal introduction display
 * Uses data from presentation.js for clean architecture
 */
export const PresentationView = () => {
    const { name, title, subtitle, tagline, status, about, skills } = presentation
    
    // Get first 3 skill categories for compact display
    const topSkills = Object.entries(skills).slice(0, 3)
    
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
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
                
                {/* Status Badge */}
                <div className="view-presentation__status">
                    <span className="view-presentation__status-badge">
                        🎓 {status.text} - {status.school}
                    </span>
                </div>
                
                {/* Skills Preview */}
                <div className="view-presentation__skills">
                    {topSkills.map(([category, items]) => (
                        <div key={category} className="view-presentation__skill-group">
                            <span className="view-presentation__skill-category">{category}</span>
                            <div className="view-presentation__skill-tags">
                                {items.slice(0, 4).map(skill => (
                                    <span key={skill} className="view-presentation__skill-tag">{skill}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Stats */}
                <div className="view-presentation__stats">
                    <div className="view-presentation__stat">
                        <span className="view-presentation__stat-label">EXPERIENCE</span>
                        <span className="view-presentation__stat-value">10+ YEARS</span>
                    </div>
                    <div className="view-presentation__stat">
                        <span className="view-presentation__stat-label">SPECIALTY</span>
                        <span className="view-presentation__stat-value">FULL-STACK</span>
                    </div>
                    <div className="view-presentation__stat">
                        <span className="view-presentation__stat-label">STATUS</span>
                        <span className="view-presentation__stat-value view-presentation__stat-value--active">SEEKING</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
