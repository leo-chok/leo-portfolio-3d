import { useCockpitLogic } from './hooks/useCockpitLogic'
import './CockpitHUD.css'

// Extracted components
import { 
    TopBar, 
    AnalyzeButton, 
    SuccessModal, 
    StatusIndicators, 
    DiscoveryScore 
} from './components'


/**
 * CockpitHUD - Main HUD overlay for the cockpit interface
 * 
 * All business logic is encapsulated in useCockpitLogic hook.
 * This component only handles rendering and prop distribution.
 */
export const CockpitHUD = () => {
    const logic = useCockpitLogic()
    
    // Hide HUD in spaceship mode
    if (logic.isSpaceshipMode) return null

    return (
        <div className={`cockpit-hud ${logic.isVisible ? 'cockpit-hud--visible' : ''}`}>
            {/* Glass effect overlay */}
            <div className="cockpit-glass">
                <div className="cockpit-glass__scanlines" />
            </div>
            
            {/* Corner brackets */}
            <div className="cockpit-bracket cockpit-bracket--tl" />
            <div className="cockpit-bracket cockpit-bracket--tr" />
            <div className="cockpit-bracket cockpit-bracket--bl" />
            <div className="cockpit-bracket cockpit-bracket--br" />
            
            
            {/* Top bar with navigation */}
            <TopBar
                displayTitle={logic.displayTitle}
                currentIndex={logic.currentIndex}
                totalSections={logic.totalSections}
                isDropdownOpen={logic.isDropdownOpen}
                onToggleDropdown={logic.toggleDropdown}
                onNavigatePrev={logic.navigatePrev}
                onNavigateNext={logic.navigateNext}
                sections={logic.sections}
                activeSection={logic.activeSection}
                analyzedSections={logic.analyzedSections}
                onSelectSection={logic.handleDropdownSelect}
                dropdownRef={logic.dropdownRef}
            />
            
            {/* Bottom bar - Analyze button */}
            <AnalyzeButton
                isVisible={logic.showAnalyzeButton}
                isLoading={logic.isLoading}
                loadingProgress={logic.loadingProgress}
                isAlreadyOpened={logic.sectionHasWindow}
                isAnalyzed={logic.analyzedSections.has(logic.trackedId)}
                onAnalyze={logic.handleAnalyze}
            />
            
            {/* Right side - Discovery Score + Spaceship Button */}
            <DiscoveryScore 
                analyzedCount={logic.analyzedCount}
                totalAnalyzable={logic.totalAnalyzable}
                allDiscovered={logic.allDiscovered}
                onLaunchSpaceship={logic.enterSpaceshipMode}
            />
            
            {/* Bottom Right - Status Indicators */}
            <StatusIndicators />
            
            {/* Success Modal */}
            <SuccessModal 
                isOpen={logic.showSuccessModal} 
                onClose={logic.closeSuccessModal}
                onLaunchSpaceship={logic.enterSpaceshipMode}
            />
        </div>
    )
}
