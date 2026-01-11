import { useRef, useEffect, useCallback } from 'react'
import { useMobileInputStore } from '../../../stores/mobileInputStore'
import './FireButton.css'

/**
 * FireButton - Press and hold to fire continuously
 * 
 * Design: Circular button with pulsing glow when active
 */
export const FireButton = ({ size = 80 }) => {
    const buttonRef = useRef(null)
    const activeTouchRef = useRef(null)
    
    const setFiring = useMobileInputStore(state => state.setFiring)
    const isFiring = useMobileInputStore(state => state.isFiring)
    
    const handleTouchStart = useCallback((e) => {
        e.preventDefault()
        activeTouchRef.current = e.touches[0].identifier
        setFiring(true)
    }, [setFiring])
    
    const handleTouchEnd = useCallback((e) => {
        e.preventDefault()
        
        // Check if our touch ended
        let found = false
        for (const touch of e.touches) {
            if (touch.identifier === activeTouchRef.current) {
                found = true
                break
            }
        }
        
        if (!found) {
            activeTouchRef.current = null
            setFiring(false)
        }
    }, [setFiring])
    
    useEffect(() => {
        const button = buttonRef.current
        if (!button) return
        
        button.addEventListener('touchstart', handleTouchStart, { passive: false })
        button.addEventListener('touchend', handleTouchEnd, { passive: false })
        button.addEventListener('touchcancel', handleTouchEnd, { passive: false })
        
        return () => {
            button.removeEventListener('touchstart', handleTouchStart)
            button.removeEventListener('touchend', handleTouchEnd)
            button.removeEventListener('touchcancel', handleTouchEnd)
        }
    }, [handleTouchStart, handleTouchEnd])
    
    return (
        <div 
            ref={buttonRef}
            className={`fire-button ${isFiring ? 'firing' : ''}`}
            style={{ width: size, height: size }}
        >
            <div className="fire-button-outer" />
            <div className="fire-button-inner" />
            <div className="fire-button-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {/* Crosshair reticle */}
                    <circle cx="12" cy="12" r="6" />
                    <line x1="12" y1="2" x2="12" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="6" y2="12" />
                    <line x1="18" y1="12" x2="22" y2="12" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
            </div>
        </div>
    )
}
