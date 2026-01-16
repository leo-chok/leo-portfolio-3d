import { useEffect, useRef, useState } from 'react'
import { useZenModeStore } from '../../stores/zenModeStore'
import './ZenModeOverlay.css'

/**
 * ZenModeOverlay - Full-screen fade overlay for zen mode transitions
 * 
 * Handles:
 * - Black fade in/out between camera positions
 * - Click anywhere to exit zen mode
 * - Timer for automatic transitions
 * - Hint fades on mouse inactivity
 */
export const ZenModeOverlay = () => {
    const isZenMode = useZenModeStore(state => state.isZenMode)
    const fadeState = useZenModeStore(state => state.fadeState)
    const fadeOpacity = useZenModeStore(state => state.fadeOpacity)
    const viewDuration = useZenModeStore(state => state.viewDuration)
    
    const exitZenMode = useZenModeStore(state => state.exitZenMode)
    const startTransition = useZenModeStore(state => state.startTransition)
    const setFadeOpacity = useZenModeStore(state => state.setFadeOpacity)
    const onFadeOutComplete = useZenModeStore(state => state.onFadeOutComplete)
    const onFadeInComplete = useZenModeStore(state => state.onFadeInComplete)
    
    const timerRef = useRef(null)
    const animationRef = useRef(null)
    const fadeStartTimeRef = useRef(0)
    const mouseTimerRef = useRef(null)
    
    // Hint visibility based on mouse activity
    const [showHint, setShowHint] = useState(true)
    
    const FADE_DURATION = 2000 // ms
    const HINT_HIDE_DELAY = 3000 // ms
    
    // Handle mouse inactivity for hint and cursor
    useEffect(() => {
        if (!isZenMode) {
            // Reset cursor when exiting zen mode
            document.body.style.cursor = ''
            return
        }
        
        const handleMouseMove = () => {
            setShowHint(true)
            document.body.style.cursor = ''
            
            // Clear existing timer
            if (mouseTimerRef.current) {
                clearTimeout(mouseTimerRef.current)
            }
            
            // Set new timer to hide hint and cursor after 3 seconds
            mouseTimerRef.current = setTimeout(() => {
                setShowHint(false)
                document.body.style.cursor = 'none'
            }, HINT_HIDE_DELAY)
        }
        
        // Initial timer
        mouseTimerRef.current = setTimeout(() => {
            setShowHint(false)
            document.body.style.cursor = 'none'
        }, HINT_HIDE_DELAY)
        
        window.addEventListener('mousemove', handleMouseMove)
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current)
            document.body.style.cursor = '' // Reset on cleanup
        }
    }, [isZenMode])
    
    // Handle Space key to skip to next camera
    useEffect(() => {
        if (!isZenMode) return
        
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && fadeState === 'visible') {
                e.preventDefault()
                // Clear the auto timer and start transition immediately
                if (timerRef.current) clearTimeout(timerRef.current)
                startTransition()
            }
        }
        
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isZenMode, fadeState, startTransition])
    
    // Handle view timer
    useEffect(() => {
        if (!isZenMode) {
            if (timerRef.current) clearTimeout(timerRef.current)
            return
        }
        
        if (fadeState === 'visible') {
            // Start timer for next transition
            timerRef.current = setTimeout(() => {
                startTransition()
            }, viewDuration * 1000)
        }
        
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [isZenMode, fadeState, viewDuration, startTransition])
    
    // Handle fade animations
    useEffect(() => {
        if (!isZenMode) return
        
        if (fadeState === 'fading-out') {
            fadeStartTimeRef.current = performance.now()
            
            const animateFadeOut = (now) => {
                const elapsed = now - fadeStartTimeRef.current
                const progress = Math.min(elapsed / FADE_DURATION, 1)
                
                setFadeOpacity(progress)
                
                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animateFadeOut)
                } else {
                    onFadeOutComplete()
                }
            }
            
            animationRef.current = requestAnimationFrame(animateFadeOut)
        } else if (fadeState === 'fading-in') {
            fadeStartTimeRef.current = performance.now()
            
            const animateFadeIn = (now) => {
                const elapsed = now - fadeStartTimeRef.current
                const progress = Math.min(elapsed / FADE_DURATION, 1)
                
                setFadeOpacity(1 - progress)
                
                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animateFadeIn)
                } else {
                    onFadeInComplete()
                }
            }
            
            animationRef.current = requestAnimationFrame(animateFadeIn)
        }
        
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
        }
    }, [fadeState, isZenMode, setFadeOpacity, onFadeOutComplete, onFadeInComplete])
    
    // Handle click to exit
    const handleClick = () => {
        if (isZenMode) {
            exitZenMode()
        }
    }
    
    if (!isZenMode) return null
    
    // Calculate hint opacity: visible when showHint is true AND during visible/fading-in states
    const hintOpacity = showHint && fadeOpacity < 0.5 ? 0.4 : 0
    
    return (
        <div 
            className="zen-mode-overlay"
            onClick={handleClick}
            style={{ 
                backgroundColor: `rgba(0, 0, 0, ${fadeOpacity})`,
                cursor: showHint ? 'pointer' : 'none'
            }}
        >
            {/* Subtle exit hint - fades on mouse inactivity */}
            <div 
                className="zen-mode-hint" 
                style={{ opacity: hintOpacity }}
            >
                Click anywhere to exit
            </div>
        </div>
    )
}
