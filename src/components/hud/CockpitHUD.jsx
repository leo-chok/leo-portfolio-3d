import { useCameraStore } from '../../stores/cameraStore'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { GALAXY_MAP } from '../../config/galaxyConfig'
import './CockpitHUD.css'

// Build navigation list from GALAXY_MAP (sun + planets)
const NAV_SECTIONS = [
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
    
    const [activeSection, setActiveSection] = useState(null)
    const [isVisible, setIsVisible] = useState(false)
    
    // Find current section index for navigation
    const currentIndex = useMemo(() => {
        if (!activeSection) return -1
        return NAV_SECTIONS.findIndex(s => s.id === activeSection)
    }, [activeSection])
    
    // Get section display name
    const sectionDisplayName = useMemo(() => {
        if (!activeSection) return 'PRÉSENTATION'
        const section = NAV_SECTIONS.find(s => s.id === activeSection)
        return section?.name || 'OVERVIEW'
    }, [activeSection])
    
    // Navigation handlers
    const navigatePrev = useCallback(() => {
        if (currentIndex <= 0) {
            // Go to last section
            const lastSection = NAV_SECTIONS[NAV_SECTIONS.length - 1]
            navigateTo(lastSection.id)
        } else {
            navigateTo(NAV_SECTIONS[currentIndex - 1].id)
        }
    }, [currentIndex, navigateTo])
    
    const navigateNext = useCallback(() => {
        if (currentIndex >= NAV_SECTIONS.length - 1 || currentIndex === -1) {
            // Go to first section (sun)
            navigateTo(NAV_SECTIONS[0].id)
        } else {
            navigateTo(NAV_SECTIONS[currentIndex + 1].id)
        }
    }, [currentIndex, navigateTo])
    
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
            setActiveSection(null)
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
                    <span className="cockpit-topbar__value">{currentIndex + 1}/{NAV_SECTIONS.length}</span>
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
