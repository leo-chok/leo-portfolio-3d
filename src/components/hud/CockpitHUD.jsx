import { useCameraStore } from '../../stores/cameraStore'
import { useEffect, useState, useMemo, useCallback } from 'react'
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
    
    const [activeSection, setActiveSection] = useState('overview')
    const [isVisible, setIsVisible] = useState(false)
    
    // Find current section index for navigation
    const currentIndex = useMemo(() => {
        return NAV_SECTIONS.findIndex(s => s.id === activeSection)
    }, [activeSection])
    
    // Get section display name
    const sectionDisplayName = useMemo(() => {
        const section = NAV_SECTIONS.find(s => s.id === activeSection)
        return section?.name || 'OVERVIEW'
    }, [activeSection])
    
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
                
                <div className="cockpit-topbar__center">
                    {/* Left arrow */}
                    <button 
                        className="cockpit-nav-arrow cockpit-nav-arrow--left"
                        onClick={navigatePrev}
                        aria-label="Section précédente"
                    >
                        <span className="cockpit-nav-arrow__icon">‹</span>
                    </button>
                    
                    {/* Section title */}
                    <span className="cockpit-topbar__title">{sectionDisplayName}</span>
                    
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
            
            {/* Bottom status bar */}
            <div className="cockpit-bottombar">
                <div className="cockpit-bottombar__item">
                    <span className="cockpit-bottombar__dot" />
                    <span>SHIELDS NOMINAL</span>
                </div>
                <div className="cockpit-bottombar__item">
                    <span className="cockpit-bottombar__dot cockpit-bottombar__dot--green" />
                    <span>ENGINES ACTIVE</span>
                </div>
                <div className="cockpit-bottombar__item">
                    <span className="cockpit-bottombar__dot cockpit-bottombar__dot--blue" />
                    <span>SCANNER READY</span>
                </div>
            </div>
        </div>
    )
}
