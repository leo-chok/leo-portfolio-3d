import { useState, useEffect, useRef } from 'react'

/**
 * useInView - Custom hook for detecting when an element enters the viewport
 * Uses the native Intersection Observer API for reliable mobile performance
 * 
 * @param {Object} options - Intersection Observer options
 * @param {number} options.threshold - Visibility threshold (0-1), default 0.1
 * @param {string} options.rootMargin - Margin around root, default '0px 0px -10% 0px'
 * @param {boolean} options.triggerOnce - Only trigger once, default true
 * @returns {[React.RefObject, boolean]} - [ref to attach to element, isInView state]
 */
export const useInView = (options = {}) => {
    const {
        threshold = 0.1,
        rootMargin = '0px 0px -10% 0px',
        triggerOnce = true
    } = options
    
    const ref = useRef(null)
    const [isInView, setIsInView] = useState(false)
    
    useEffect(() => {
        const element = ref.current
        if (!element) return
        
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true)
                    if (triggerOnce) {
                        observer.unobserve(element)
                    }
                } else if (!triggerOnce) {
                    setIsInView(false)
                }
            },
            { threshold, rootMargin }
        )
        
        observer.observe(element)
        
        return () => {
            observer.disconnect()
        }
    }, [threshold, rootMargin, triggerOnce])
    
    return [ref, isInView]
}
