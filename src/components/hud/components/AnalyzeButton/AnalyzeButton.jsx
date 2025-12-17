import './AnalyzeButton.css'

/**
 * AnalyzeButton - Bottom bar analyze/open data button
 * Handles loading state, already opened state, and analyze/open actions
 */
export const AnalyzeButton = ({
    isVisible,
    isLoading,
    loadingProgress,
    isAlreadyOpened,
    isAnalyzed,
    onAnalyze
}) => {
    if (!isVisible) return null

    return (
        <div className="cockpit-bottombar">
            <div className="cockpit-analyze">
                {isLoading ? (
                    <div className="cockpit-analyze__loading">
                        <div className="cockpit-analyze__loading-bar">
                            <div 
                                className="cockpit-analyze__loading-fill"
                                style={{ width: `${loadingProgress * 100}%` }}
                            />
                        </div>
                        <span className="cockpit-analyze__loading-text">DECRYPTING...</span>
                    </div>
                ) : isAlreadyOpened ? (
                    <span className="cockpit-analyze__done">ALREADY OPENED</span>
                ) : isAnalyzed ? (
                    <button 
                        className="cockpit-analyze__button cockpit-analyze__button--open"
                        onClick={onAnalyze}
                    >
                        <span className="cockpit-analyze__shimmer" />
                        <span className="cockpit-analyze__text">OPEN DATA</span>
                    </button>
                ) : (
                    <button 
                        className="cockpit-analyze__button"
                        onClick={onAnalyze}
                    >
                        <span className="cockpit-analyze__shimmer" />
                        <span className="cockpit-analyze__text">ANALYSER</span>
                    </button>
                )}
            </div>
        </div>
    )
}
