import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes, faSun, faBriefcase, faTools, faEnvelope, faLink } from '@fortawesome/free-solid-svg-icons'
import { useCameraStore } from '../../stores/cameraStore'
import { DraggableWrapper } from './common/DraggableWrapper'
import './NavigationPanel.css'

const NAV_ITEMS = [
    { id: 'presentation', name: 'Présentation', icon: faSun },
    { id: 'portfolio', name: 'Portfolio', icon: faBriefcase },
    { id: 'skills', name: 'Skills', icon: faTools },
    { id: 'contact', name: 'Contact', icon: faEnvelope },
    { id: 'platforms', name: 'Platforms', icon: faLink },
]

export const NavigationPanel = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [initialPos, setInitialPos] = useState(null)
    
    // Get navigation functions and current tracked ID from store
    const navigateTo = useCameraStore((state) => state.navigateTo)
    const returnToOverview = useCameraStore((state) => state.returnToOverview)
    const trackedId = useCameraStore((state) => state.trackedId)

    useEffect(() => {
        // Initialize position at top left as requested
        setInitialPos({ x: 30, y: 30 })
    }, [])
    
    const handleNavClick = (id) => {
        if (id === 'presentation') {
            // Return to overview - stop tracking and animate back
            returnToOverview()
        } else {
            navigateTo(id)
        }
        setIsOpen(false)
    }
    
    const handleToggle = () => {
        setIsOpen(!isOpen)
    }
    
    if (!initialPos) return null // Wait for client mount
    
    return (
        <DraggableWrapper 
            initialPosition={initialPos} 
            handleSelector=".nav-drag-handle"
        >
            <div className="nav-container">
                {/* Toggle Button */}
                <button 
                    className={`nav-toggle nav-drag-handle ${isOpen ? 'nav-toggle--open' : ''}`}
                    onClick={handleToggle}
                    // Remove explicit stopPropagation to let DraggableWrapper catch it?
                    // DraggableWrapper uses its own onMouseDown on the wrapper div.
                    // Wait, DraggableWrapper wraps the whole container.
                    // If I click button, event bubbles to Wrapper. Wrapper checks handleSelector.
                    // If button has nav-drag-handle, it should work.
                >
                    <div style={{ pointerEvents: 'none' }}>
                        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
                    </div>
                    <span className="nav-toggle__label" style={{ pointerEvents: 'none' }}>Navigation</span>
                </button>
                
                {/* Panel - Using HoloWindow Structure */}
                <div className={`nav-panel ${isOpen ? 'nav-panel--open' : ''}`}>
                    <div className="nav-panel__scanlines" />
                    
                    {/* Corner brackets */}
                    <div className="nav-panel__bracket nav-panel__bracket--tl" />
                    <div className="nav-panel__bracket nav-panel__bracket--tr" />
                    <div className="nav-panel__bracket nav-panel__bracket--bl" />
                    <div className="nav-panel__bracket nav-panel__bracket--br" />

                    {/* Header */}
                    <div className="nav-panel__header nav-drag-handle">
                        <div className="nav-panel__grip-dots">⠿</div>
                        <div className="nav-panel__header-content">
                            <span className="nav-panel__title">NAVIGATION</span>
                            <span className="nav-panel__subtitle">SYSTEM LINKS</span>
                        </div>
                        <div className="nav-panel__header-actions">
                            <button 
                                className="nav-panel__close" 
                                onClick={() => setIsOpen(false)}
                                onMouseDown={(e) => e.stopPropagation()}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                    
                    <nav className="nav-panel__list">
                        {NAV_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                className={`nav-item ${
                                    (item.id === 'presentation' && !trackedId) || trackedId === item.id 
                                        ? 'nav-item--active' 
                                        : ''
                                }`}
                                onClick={() => handleNavClick(item.id)}
                            >
                                <FontAwesomeIcon icon={item.icon} className="nav-item__icon" />
                                <span className="nav-item__name">{item.name}</span>
                                <div className="nav-item__glow"></div>
                            </button>
                        ))}
                    </nav>
                    
                    {/* Footer */}
                    <div className="nav-panel__footer">
                        <div className="nav-panel__footer-line"></div>
                        <span className="nav-panel__hint">SYSTEM ACTIVE</span>
                    </div>
                </div>
                
                {/* Backdrop - Only blocks clicks behind panel, but we want full HUD interactive */}
                {/* Removed global backdrop to follow "floating window" philosophy */}
            </div>
        </DraggableWrapper>
    )
}
