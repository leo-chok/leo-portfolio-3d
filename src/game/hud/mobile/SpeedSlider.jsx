import { useRef, useEffect, useCallback } from 'react'
import { useMobileInputStore } from '../../../stores/mobileInputStore'
import { useSpaceshipStore } from '../../../stores/spaceshipStore'
import { PLAYER_CONFIG } from '../../config'
import './SpeedSlider.css'

/**
 * SpeedSlider - Horizontal slider for speed control
 * 
 * Design: Shows both target speed (thumb) and actual speed (fill bar)
 * Drag left-right to control speed 0-100%
 */
export const SpeedSlider = ({ width = 150, height = 50 }) => {
    const containerRef = useRef(null)
    const fillRef = useRef(null)
    const thumbRef = useRef(null)
    const activeTouchRef = useRef(null)
    
    // Target speed (what user wants)
    const speedPercent = useMobileInputStore(state => state.speedPercent)
    const setSpeedPercent = useMobileInputStore(state => state.setSpeedPercent)
    
    // Actual speed (what ship is doing)
    const actualSpeed = useSpaceshipStore(state => state.speed)
    const maxSpeed = PLAYER_CONFIG.maxSpeedKmh
    
    const updateSpeed = useCallback((clientX) => {
        if (!containerRef.current) return
        
        const rect = containerRef.current.getBoundingClientRect()
        const relativeX = clientX - rect.left
        const percent = Math.max(0, Math.min(1, relativeX / rect.width))
        
        setSpeedPercent(percent)
    }, [setSpeedPercent])
    
    // Update thumb position based on target (slider position)
    useEffect(() => {
        if (!thumbRef.current) return
        thumbRef.current.style.left = `${speedPercent * 100}%`
    }, [speedPercent])
    
    // Update fill bar based on ACTUAL speed (real-time)
    useEffect(() => {
        if (!fillRef.current) return
        const actualPercent = Math.min(1, actualSpeed / maxSpeed)
        // Exponential visual for better feel
        const visualPercent = Math.pow(actualPercent, 0.7) * 100
        fillRef.current.style.width = `${visualPercent}%`
    }, [actualSpeed, maxSpeed])
    
    const handleTouchStart = useCallback((e) => {
        e.preventDefault()
        const touch = e.touches[0]
        activeTouchRef.current = touch.identifier
        updateSpeed(touch.clientX)
    }, [updateSpeed])
    
    const handleTouchMove = useCallback((e) => {
        e.preventDefault()
        for (const touch of e.touches) {
            if (touch.identifier === activeTouchRef.current) {
                updateSpeed(touch.clientX)
                break
            }
        }
    }, [updateSpeed])
    
    const handleTouchEnd = useCallback((e) => {
        e.preventDefault()
        activeTouchRef.current = null
    }, [])
    
    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        
        container.addEventListener('touchstart', handleTouchStart, { passive: false })
        container.addEventListener('touchmove', handleTouchMove, { passive: false })
        container.addEventListener('touchend', handleTouchEnd, { passive: false })
        container.addEventListener('touchcancel', handleTouchEnd, { passive: false })
        
        return () => {
            container.removeEventListener('touchstart', handleTouchStart)
            container.removeEventListener('touchmove', handleTouchMove)
            container.removeEventListener('touchend', handleTouchEnd)
            container.removeEventListener('touchcancel', handleTouchEnd)
        }
    }, [handleTouchStart, handleTouchMove, handleTouchEnd])
    
    // Display actual speed in km/h
    const speedDisplay = Math.round(actualSpeed)
    
    return (
        <div 
            ref={containerRef}
            className="speed-slider"
            style={{ width, height }}
        >
            <div className="speed-slider-track">
                <div ref={fillRef} className="speed-slider-fill" />
                <div className="speed-slider-segments">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="speed-slider-segment" />
                    ))}
                </div>
            </div>
            <div ref={thumbRef} className="speed-slider-thumb" />
            <div className="speed-slider-label">
                <span className="speed-value">{speedDisplay}</span>
                <span className="speed-unit">KM/H</span>
            </div>
        </div>
    )
}

