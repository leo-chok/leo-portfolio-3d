import { useRef, useEffect, useCallback } from 'react'
import { useMobileInputStore } from '../../../stores/mobileInputStore'
import './VirtualJoystick.css'

/**
 * VirtualJoystick - Touch joystick for ship direction control
 * 
 * Futuristic design matching HUD style:
 * - Outer ring with glow
 * - Inner thumb that follows touch
 * - Returns normalized -1 to 1 values for x/y
 */
export const VirtualJoystick = ({ size = 120 }) => {
    const containerRef = useRef(null)
    const thumbRef = useRef(null)
    const activeTouchRef = useRef(null)
    const centerRef = useRef({ x: 0, y: 0 })
    
    const setLeftStick = useMobileInputStore(state => state.setLeftStick)
    const setTouchActive = useMobileInputStore(state => state.setTouchActive)
    
    const maxDistance = size / 2 - 15 // Thumb radius
    
    const updatePosition = useCallback((clientX, clientY) => {
        if (!containerRef.current || !thumbRef.current) return
        
        const dx = clientX - centerRef.current.x
        const dy = clientY - centerRef.current.y
        
        // Calculate distance and clamp to max
        const distance = Math.sqrt(dx * dx + dy * dy)
        const clampedDistance = Math.min(distance, maxDistance)
        
        // Normalize direction
        const angle = Math.atan2(dy, dx)
        const clampedX = Math.cos(angle) * clampedDistance
        const clampedY = Math.sin(angle) * clampedDistance
        
        // Update thumb position
        thumbRef.current.style.transform = `translate(${clampedX}px, ${clampedY}px)`
        
        // Update store with normalized values (-1 to 1)
        const normalizedX = clampedX / maxDistance
        const normalizedY = clampedY / maxDistance
        setLeftStick(normalizedX, -normalizedY) // Invert Y for intuitive control
    }, [maxDistance, setLeftStick])
    
    const handleTouchStart = useCallback((e) => {
        e.preventDefault()
        const touch = e.touches[0]
        activeTouchRef.current = touch.identifier
        
        const rect = containerRef.current.getBoundingClientRect()
        centerRef.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        }
        
        setTouchActive(true)
        updatePosition(touch.clientX, touch.clientY)
    }, [setTouchActive, updatePosition])
    
    const handleTouchMove = useCallback((e) => {
        e.preventDefault()
        for (const touch of e.touches) {
            if (touch.identifier === activeTouchRef.current) {
                updatePosition(touch.clientX, touch.clientY)
                break
            }
        }
    }, [updatePosition])
    
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
            // Reset thumb to center
            if (thumbRef.current) {
                thumbRef.current.style.transform = 'translate(0px, 0px)'
            }
            setLeftStick(0, 0)
        }
    }, [setLeftStick])
    
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
    
    return (
        <div 
            ref={containerRef}
            className="virtual-joystick"
            style={{ width: size, height: size }}
        >
            <div className="joystick-outer-ring" />
            <div className="joystick-inner-ring" />
            <div 
                ref={thumbRef}
                className="joystick-thumb"
            />
        </div>
    )
}
