import './StatusIndicators.css'

/**
 * StatusIndicators - Bottom right status dots
 * Shows SHIELD, ENGINE, SCANNER status
 */
export const StatusIndicators = () => {
    return (
        <div className="cockpit-status">
            <div className="cockpit-status__indicator cockpit-status__indicator--active">
                <span className="cockpit-status__dot" />
                <span className="cockpit-status__label">SHIELD</span>
            </div>
            <div className="cockpit-status__indicator cockpit-status__indicator--active">
                <span className="cockpit-status__dot" />
                <span className="cockpit-status__label">ENGINE</span>
            </div>
            <div className="cockpit-status__indicator cockpit-status__indicator--active">
                <span className="cockpit-status__dot" />
                <span className="cockpit-status__label">SCANNER</span>
            </div>
        </div>
    )
}
