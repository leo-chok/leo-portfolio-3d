import { useState, useEffect } from 'react'

/**
 * useIsMobile - Hook to detect mobile viewport
 * 
 * @param {number} breakpoint - Max width to consider as mobile (default: 768)
 * @returns {boolean} - True if viewport is mobile-sized
 */
export const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(false)
    
    useEffect(() => {
        // Check initial value
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= breakpoint)
        }
        
        checkMobile()
        
        // Listen for resize
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [breakpoint])
    
    return isMobile
}
