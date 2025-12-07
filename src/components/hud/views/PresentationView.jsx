import './PresentationView.css'

export const PresentationView = () => {
    return (
        <div className="view-presentation">
            {/* Portrait Photo */}
            <div className="view-presentation__photo">
                <div className="view-presentation__photo-frame">
                    <img 
                        src="/portrait.PNG" 
                        alt="Portrait" 
                        className="view-presentation__photo-img"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <div className="view-presentation__photo-label">IDENTITY SCAN</div>
            </div>
            
            {/* Text Content */}
            <div className="view-presentation__text">
                <h3 className="view-presentation__subtitle">Mission Commander</h3>
                
                <div className="view-presentation__bio">
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                    </p>
                    <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse 
                        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat 
                        cupidatat non proident, sunt in culpa qui officia deserunt.
                    </p>
                    <p>
                        Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor 
                        in reprehenderit in voluptate velit esse cillum dolore eu fugiat.
                    </p>
                </div>
                
                {/* Stats */}
                <div className="view-presentation__stats">
                    <div className="view-presentation__stat">
                        <span className="view-presentation__stat-label">EXPERIENCE</span>
                        <span className="view-presentation__stat-value">5+ YEARS</span>
                    </div>
                    <div className="view-presentation__stat">
                        <span className="view-presentation__stat-label">SPECIALTY</span>
                        <span className="view-presentation__stat-value">FULL-STACK</span>
                    </div>
                    <div className="view-presentation__stat">
                        <span className="view-presentation__stat-label">STATUS</span>
                        <span className="view-presentation__stat-value view-presentation__stat-value--active">ACTIVE</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
