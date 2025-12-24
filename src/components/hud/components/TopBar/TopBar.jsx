import { useTranslation } from '../../../../hooks/useTranslation'
import { LanguageToggle } from '../LanguageToggle'
import './TopBar.css'

/**
 * TopBar - Navigation header for CockpitHUD
 * Displays section navigation with prev/next arrows and dropdown
 */
export const TopBar = ({
    displayTitle,
    currentIndex,
    totalSections,
    isDropdownOpen,
    onToggleDropdown,
    onNavigatePrev,
    onNavigateNext,
    sections,
    activeSection,
    analyzedSections,
    onSelectSection,
    dropdownRef
}) => {
    const { t } = useTranslation()
    const ui = t('ui')
    
    return (
        <div className="cockpit-topbar">
            <div className="cockpit-topbar__left">
                <span className="cockpit-topbar__label">{ui.sysOnline}</span>
                <span className="cockpit-topbar__value">{ui.online}</span>
                <LanguageToggle />
            </div>
            
            <div className="cockpit-topbar__center" ref={dropdownRef}>
                {/* Left arrow */}
                <button 
                    className="cockpit-nav-arrow cockpit-nav-arrow--left"
                    onClick={onNavigatePrev}
                    aria-label={ui.previousSection}
                >
                    <span className="cockpit-nav-arrow__icon">‹</span>
                </button>
                
                {/* Section title - clickable for dropdown */}
                <button 
                    className={`cockpit-topbar__title ${isDropdownOpen ? 'cockpit-topbar__title--active' : ''}`}
                    onClick={onToggleDropdown}
                >
                    {displayTitle}
                    <span className="cockpit-topbar__dropdown-icon">▼</span>
                </button>
                
                {/* Dropdown menu */}
                {isDropdownOpen && (
                    <div className="cockpit-dropdown">
                        {sections.map((section, index) => {
                            const isSectionAnalyzed = section.isOverview || analyzedSections.has(section.id)
                            return (
                                <button
                                    key={section.id}
                                    className={`cockpit-dropdown__item ${section.id === activeSection ? 'cockpit-dropdown__item--active' : ''}`}
                                    onClick={() => onSelectSection(section)}
                                >
                                    <span className="cockpit-dropdown__index">
                                        {String(index).padStart(2, '0')}
                                    </span>
                                    <span className={`cockpit-dropdown__name ${!isSectionAnalyzed ? 'cockpit-dropdown__name--encrypted' : ''}`}>
                                        {isSectionAnalyzed ? section.name : '???'}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                )}
                
                {/* Right arrow */}
                <button 
                    className="cockpit-nav-arrow cockpit-nav-arrow--right"
                    onClick={onNavigateNext}
                    aria-label={ui.nextSection}
                >
                    <span className="cockpit-nav-arrow__icon">›</span>
                </button>
            </div>
            
            <div className="cockpit-topbar__right">
                <span className="cockpit-topbar__label">{ui.nav}</span>
                <span className="cockpit-topbar__value">{String(currentIndex).padStart(2, '0')}/{String(totalSections - 1).padStart(2, '0')}</span>
            </div>
        </div>
    )
}

