import { useCameraStore } from '../../stores/cameraStore'
import { useWindowStore } from '../../stores/windowStore'
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { GALAXY_MAP } from '../../config/galaxyConfig'
import './CockpitHUD.css'

// Build navigation list: Overview (00) + sun + planets
const NAV_SECTIONS = [
    { id: 'overview', name: 'OVERVIEW', isOverview: true },
    { id: GALAXY_MAP.sun.id, name: GALAXY_MAP.sun.name },
    ...GALAXY_MAP.planets.map(p => ({ id: p.id, name: p.name }))
]

export const CockpitHUD = () => {
    const isTracking = useCameraStore((state) => state.isTracking)
    const trackedRef = useCameraStore((state) => state.trackedRef)
    const trackedId = useCameraStore((state) => state.trackedId)
    const bodyRegistry = useCameraStore((state) => state.bodyRegistry)
    const navigateTo = useCameraStore((state) => state.navigateTo)
    const returnToOverview = useCameraStore((state) => state.returnToOverview)
    
    // Window store
    const startLoading = useWindowStore((state) => state.startLoading)
    const loadingSection = useWindowStore((state) => state.loadingSection)
    const loadingProgress = useWindowStore((state) => state.loadingProgress)
    const windows = useWindowStore((state) => state.windows)
    
    const [activeSection, setActiveSection] = useState('overview')
    const [isVisible, setIsVisible] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    
    const dropdownRef = useRef(null)
    
    // Find current section index for navigation
    const currentIndex = useMemo(() => {
        return NAV_SECTIONS.findIndex(s => s.id === activeSection)
    }, [activeSection])
    
    // Get section display name
    const sectionDisplayName = useMemo(() => {
        const section = NAV_SECTIONS.find(s => s.id === activeSection)
        return section?.name || 'OVERVIEW'
    }, [activeSection])
    
    // Check if current section already has window open
    const sectionHasWindow = useMemo(() => {
        return windows.some(w => w.sectionId === activeSection)
    }, [windows, activeSection])
    
    // Navigate to a section (handles overview specially)
    const goToSection = useCallback((section) => {
        if (section.isOverview) {
            returnToOverview()
            setActiveSection('overview')
        } else {
            navigateTo(section.id)
            setActiveSection(section.id)
        }
    }, [navigateTo, returnToOverview])
    
    // Navigation handlers with cycling
    const navigatePrev = useCallback(() => {
        const newIndex = currentIndex <= 0 ? NAV_SECTIONS.length - 1 : currentIndex - 1
        goToSection(NAV_SECTIONS[newIndex])
    }, [currentIndex, goToSection])
    
    const navigateNext = useCallback(() => {
        const newIndex = currentIndex >= NAV_SECTIONS.length - 1 ? 0 : currentIndex + 1
        goToSection(NAV_SECTIONS[newIndex])
    }, [currentIndex, goToSection])
    
    // Handle analyze button click
    const handleAnalyze = useCallback(() => {
        if (trackedId && !sectionHasWindow && !loadingSection) {
            startLoading(trackedId)
        }
    }, [trackedId, sectionHasWindow, loadingSection, startLoading])
    
    // Toggle dropdown
    const toggleDropdown = useCallback(() => {
        setIsDropdownOpen(prev => !prev)
    }, [])
    
    // Handle dropdown item click
    const handleDropdownSelect = useCallback((section) => {
        goToSection(section)
        setIsDropdownOpen(false)
    }, [goToSection])
    
    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false)
            }
        }
        
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isDropdownOpen])
    
    useEffect(() => {
        // Update active section from trackedId or by finding in registry
        if (trackedId) {
            setActiveSection(trackedId)
            setIsVisible(true)
        } else if (isTracking && trackedRef) {
            for (const [id, data] of Object.entries(bodyRegistry)) {
                if (data.ref === trackedRef) {
                    setActiveSection(id)
                    setIsVisible(true)
                    return
                }
            }
        } else {
            // Not tracking = Overview mode
            setActiveSection('overview')
            setIsVisible(true)
        }
    }, [isTracking, trackedRef, trackedId, bodyRegistry])
    
    // Ensure HUD is visible initially
    useEffect(() => {
        setIsVisible(true)
    }, [])
    
    // Show analyze button only when tracking and not in overview
    const showAnalyzeButton = isTracking && trackedId && activeSection !== 'overview'
    const isLoading = loadingSection === trackedId

    return (
        <div className={`cockpit-hud ${isVisible ? 'cockpit-hud--visible' : ''}`}>
            {/* Glass effect overlay */}
            <div className="cockpit-glass">
                <div className="cockpit-glass__reflection" />
                <div className="cockpit-glass__scanlines" />
            </div>
            
            {/* Corner brackets */}
            <div className="cockpit-bracket cockpit-bracket--tl" />
            <div className="cockpit-bracket cockpit-bracket--tr" />
            <div className="cockpit-bracket cockpit-bracket--bl" />
            <div className="cockpit-bracket cockpit-bracket--br" />
            
            {/* Top bar with navigation */}
            <div className="cockpit-topbar">
                <div className="cockpit-topbar__left">
                    <span className="cockpit-topbar__label">SYS</span>
                    <span className="cockpit-topbar__value">ONLINE</span>
                </div>
                
                <div className="cockpit-topbar__center" ref={dropdownRef}>
                    {/* Left arrow */}
                    <button 
                        className="cockpit-nav-arrow cockpit-nav-arrow--left"
                        onClick={navigatePrev}
                        aria-label="Section précédente"
                    >
                        <span className="cockpit-nav-arrow__icon">‹</span>
                    </button>
                    
                    {/* Section title - clickable for dropdown */}
                    <button 
                        className={`cockpit-topbar__title ${isDropdownOpen ? 'cockpit-topbar__title--active' : ''}`}
                        onClick={toggleDropdown}
                    >
                        {sectionDisplayName}
                        <span className="cockpit-topbar__dropdown-icon">▼</span>
                    </button>
                    
                    {/* Dropdown menu */}
                    {isDropdownOpen && (
                        <div className="cockpit-dropdown">
                            {NAV_SECTIONS.map((section, index) => (
                                <button
                                    key={section.id}
                                    className={`cockpit-dropdown__item ${section.id === activeSection ? 'cockpit-dropdown__item--active' : ''}`}
                                    onClick={() => handleDropdownSelect(section)}
                                >
                                    <span className="cockpit-dropdown__index">
                                        {String(index).padStart(2, '0')}
                                    </span>
                                    <span className="cockpit-dropdown__name">{section.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {/* Right arrow */}
                    <button 
                        className="cockpit-nav-arrow cockpit-nav-arrow--right"
                        onClick={navigateNext}
                        aria-label="Section suivante"
                    >
                        <span className="cockpit-nav-arrow__icon">›</span>
                    </button>
                </div>
                
                <div className="cockpit-topbar__right">
                    <span className="cockpit-topbar__label">NAV</span>
                    <span className="cockpit-topbar__value">{String(currentIndex).padStart(2, '0')}/{String(NAV_SECTIONS.length - 1).padStart(2, '0')}</span>
                </div>
            </div>
            
            {/* Bottom bar - Analyze button only */}
            <div className="cockpit-bottombar">
                {showAnalyzeButton && (
                    <div className="cockpit-analyze">
                        {isLoading ? (
                            <div className="cockpit-analyze__loading">
                                <div className="cockpit-analyze__loading-bar">
                                    <div 
                                        className="cockpit-analyze__loading-fill"
                                        style={{ width: `${loadingProgress * 100}%` }}
                                    />
                                </div>
                                <span className="cockpit-analyze__loading-text">ANALYZING...</span>
                            </div>
                        ) : sectionHasWindow ? (
                            <span className="cockpit-analyze__done">ALREADY ANALYZED</span>
                        ) : (
                            <button 
                                className="cockpit-analyze__button"
                                onClick={handleAnalyze}
                            >
                                <span className="cockpit-analyze__shimmer" />
                                <span className="cockpit-analyze__text">ANALYSER</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
            
            {/* Right side status panel */}
            <div className="cockpit-status-panel">
                <div className="cockpit-status-panel__item">
                    <span className="cockpit-status-panel__dot" />
                    <span>SHIELDS NOMINAL</span>
                </div>
                <div className="cockpit-status-panel__item">
                    <span className="cockpit-status-panel__dot cockpit-status-panel__dot--green" />
                    <span>ENGINES ACTIVE</span>
                </div>
                <div className="cockpit-status-panel__item">
                    <span className="cockpit-status-panel__dot cockpit-status-panel__dot--blue" />
                    <span>SCANNER READY</span>
                </div>
            </div>
        </div>
    )
}
