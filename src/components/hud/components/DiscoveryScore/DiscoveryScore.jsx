import { useTranslation } from '../../../../hooks/useTranslation'
import './DiscoveryScore.css'

/**
 * DiscoveryScore - Discovery gauge + spaceship button
 * 
 * Props:
 * - analyzedCount: number - sections discovered
 * - totalAnalyzable: number - total sections
 * - allDiscovered: boolean - all sections found
 * - onLaunchSpaceship: function - callback to enter spaceship mode
 */
export const DiscoveryScore = ({ 
    analyzedCount, 
    totalAnalyzable, 
    allDiscovered, 
    onLaunchSpaceship 
}) => {
    const { t } = useTranslation()
    const ui = t('ui')
    
    return (
        <div className="cockpit-score">
            <div className="cockpit-score__label">{ui.discoveries}</div>
            <div className="cockpit-score__equalizer">
                {[...Array(5)].map((_, i) => {
                    // 1 bar per discovery, from bottom to top
                    const barIndex = 4 - i // Reverse so 0 is top, 4 is bottom
                    const isActive = barIndex < analyzedCount
                    return (
                        <div 
                            key={i}
                            className={`cockpit-score__bar-segment ${isActive ? 'cockpit-score__bar-segment--active' : ''}`}
                        />
                    )
                })}
            </div>
            <div className={`cockpit-score__value ${allDiscovered ? 'cockpit-score__value--complete' : ''}`}>
                {analyzedCount}/{totalAnalyzable}
            </div>
            
            {/* Spaceship Button - below gauge, aligned */}
            {allDiscovered && (
                <button 
                    className="cockpit-spaceship-btn"
                    onClick={onLaunchSpaceship}
                    title={ui.launchSpaceship}
                >
                    <img 
                        src="/Spaceship.svg" 
                        alt={ui.launchSpaceship} 
                        className="cockpit-spaceship-btn__icon"
                    />
                </button>
            )}
        </div>
    )
}

