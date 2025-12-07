import { useCameraStore } from '../../stores/cameraStore'
import { useEffect, useState } from 'react'
import './CockpitHUD.css'

export const CockpitHUD = () => {
    const isTracking = useCameraStore((state) => state.isTracking)
    const trackedRef = useCameraStore((state) => state.trackedRef)
    const bodyRegistry = useCameraStore((state) => state.bodyRegistry)
    
    // Simple logic to just show the section name in TopBar
    const [activeSection, setActiveSection] = useState(null)
    const [isVisible, setIsVisible] = useState(false)
    
    useEffect(() => {
        // Find which section is being tracked
        if (isTracking && trackedRef) {
            for (const [id, data] of Object.entries(bodyRegistry)) {
                if (data.ref === trackedRef) {
                    setActiveSection(id)
                    setIsVisible(true)
                    return
                }
            }
        } else {
            // Keep visible but reset section or fully hide?
            // User requested removing "small windows", but top/bottom bars are cool.
            // Let's keep bars always visible or visible on load?
            // The original logic hid the HUD when not distinct section?
            // Actually original logic was: hidden when not tracking?
            // Let's keep "OVERVIEW" when not tracking.
            setActiveSection(null)
            setIsVisible(true) // Always visible for immersion? Or wait for load?
        }
    }, [isTracking, trackedRef, bodyRegistry])
    
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
            
            {/* Top bar */}
            <div className="cockpit-topbar">
                <div className="cockpit-topbar__left">
                    <span className="cockpit-topbar__label">SYS</span>
                    <span className="cockpit-topbar__value">ONLINE</span>
                </div>
                <div className="cockpit-topbar__center">
                   <span className="cockpit-topbar__title">SCALAR NAVIGATION</span>
                </div>
                <div className="cockpit-topbar__right">
                    <span className="cockpit-topbar__label">NAV</span>
                    <span className="cockpit-topbar__value">{activeSection?.toUpperCase() || 'OVERVIEW'}</span>
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
