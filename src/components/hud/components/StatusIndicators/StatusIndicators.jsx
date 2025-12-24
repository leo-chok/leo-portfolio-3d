import { useTranslation } from '../../../../hooks/useTranslation'
import './StatusIndicators.css'

/**
 * StatusIndicators - Bottom right status dots
 * Shows SHIELD, ENGINE, SCANNER status
 */
export const StatusIndicators = () => {
    const { t } = useTranslation()
    const status = t('ui.status')
    
    return (
        <div className="cockpit-status">
            <div className="cockpit-status__indicator cockpit-status__indicator--active">
                <span className="cockpit-status__dot" />
                <span className="cockpit-status__label">{status?.shield || 'SHIELD'}</span>
            </div>
            <div className="cockpit-status__indicator cockpit-status__indicator--active">
                <span className="cockpit-status__dot" />
                <span className="cockpit-status__label">{status?.engine || 'ENGINE'}</span>
            </div>
            <div className="cockpit-status__indicator cockpit-status__indicator--active">
                <span className="cockpit-status__dot" />
                <span className="cockpit-status__label">{status?.scanner || 'SCANNER'}</span>
            </div>
        </div>
    )
}

