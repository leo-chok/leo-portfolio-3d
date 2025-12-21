import { useCockpitLogic } from './hooks/useCockpitLogic'
import './CockpitHUDMobile.css'

/**
 * CockpitHUDMobile - Mobile-optimized HUD overlay
 * 
 * Simplified interface for touch devices:
 * - System name displayed above analyze button
 * - Navigation arrows (prev/next)
 * - Discovery counter
 * - Analyze button at bottom
 */
export const CockpitHUDMobile = () => {
    const logic = useCockpitLogic()
    
    // Hide HUD in spaceship mode
    if (logic.isSpaceshipMode) return null

    return (
        <div className={`hud-mobile ${logic.isVisible ? 'hud-mobile--visible' : ''}`}>
            
            {/* Top Bar - Navigation */}
            <div className="hud-mobile__top">
                {/* Nav arrows */}
                <button 
                    className="hud-mobile__nav-btn"
                    onClick={logic.navigatePrev}
                >
                    ‹
                </button>
                
                {/* Discovery counter */}
                <div className="hud-mobile__counter">
                    <span className="hud-mobile__counter-current">{logic.analyzedCount}</span>
                    <span className="hud-mobile__counter-separator">/</span>
                    <span className="hud-mobile__counter-total">{logic.totalAnalyzable}</span>
                </div>
                
                <button 
                    className="hud-mobile__nav-btn"
                    onClick={logic.navigateNext}
                >
                    ›
                </button>
            </div>
            
            {/* Bottom Section - System Name + Analyze */}
            <div className="hud-mobile__bottom">
                {/* System name - only show when tracking */}
                {logic.showAnalyzeButton && (
                    <div className="hud-mobile__system-name">
                        <span className="hud-mobile__system-label">SYSTÈME</span>
                        <span className="hud-mobile__system-title">{logic.displayTitle}</span>
                    </div>
                )}
                
                {/* Analyze button */}
                {logic.showAnalyzeButton && (
                    <button 
                        className={`hud-mobile__analyze ${logic.isLoading ? 'hud-mobile__analyze--loading' : ''}`}
                        onClick={logic.handleAnalyze}
                        disabled={logic.isLoading}
                    >
                        {logic.isLoading ? (
                            <>
                                <span className="hud-mobile__analyze-progress" 
                                    style={{ width: `${logic.loadingProgress}%` }} 
                                />
                                <span className="hud-mobile__analyze-text">
                                    ANALYSE... {Math.round(logic.loadingProgress)}%
                                </span>
                            </>
                        ) : logic.analyzedSections.has(logic.trackedId) ? (
                            <span className="hud-mobile__analyze-text">
                                {logic.sectionHasWindow ? '✓ ANALYSÉ' : 'OUVRIR'}
                            </span>
                        ) : (
                            <span className="hud-mobile__analyze-text">ANALYSER</span>
                        )}
                    </button>
                )}
            </div>
            
            {/* Corner brackets - minimal version */}
            <div className="hud-mobile__bracket hud-mobile__bracket--tl" />
            <div className="hud-mobile__bracket hud-mobile__bracket--tr" />
            <div className="hud-mobile__bracket hud-mobile__bracket--bl" />
            <div className="hud-mobile__bracket hud-mobile__bracket--br" />
        </div>
    )
}
