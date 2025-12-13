import { useState, useEffect, useRef } from 'react'

// Characters used for scrambled text (sci-fi look)
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(){}[]|;:<>?/~`'

/**
 * Generate a scrambled version of text
 * Keeps same length, replaces with random sci-fi characters
 */
export const scrambleText = (text) => {
    return text
        .split('')
        .map(char => {
            if (char === ' ') return ' '
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        })
        .join('')
}

/**
 * Generate a consistent scrambled text (same result for same input)
 * Uses a simple hash-based approach
 */
export const scrambleTextConsistent = (text) => {
    return text
        .split('')
        .map((char, i) => {
            if (char === ' ') return ' '
            // Use char code + position as seed for consistent scramble
            const seed = char.charCodeAt(0) + i * 7
            return SCRAMBLE_CHARS[seed % SCRAMBLE_CHARS.length]
        })
        .join('')
}

/**
 * React hook for text decryption animation
 * Returns the current display text during animation
 * 
 * @param {string} realText - The actual text to reveal
 * @param {boolean} isDecrypting - Whether decryption animation is active
 * @param {number} duration - Animation duration in ms
 * @param {boolean} isRevealed - Whether text is permanently revealed
 */
export const useDecryptingText = (realText, isDecrypting, duration = 500, isRevealed = false) => {
    const [displayText, setDisplayText] = useState(() => 
        isRevealed ? realText : scrambleTextConsistent(realText)
    )
    const animationRef = useRef(null)
    const startTimeRef = useRef(null)
    
    useEffect(() => {
        // If already revealed, show real text
        if (isRevealed && !isDecrypting) {
            setDisplayText(realText)
            return
        }
        
        // If not decrypting, show scrambled
        if (!isDecrypting && !isRevealed) {
            setDisplayText(scrambleTextConsistent(realText))
            return
        }
        
        // Start decryption animation
        if (isDecrypting) {
            startTimeRef.current = Date.now()
            
            const animate = () => {
                const elapsed = Date.now() - startTimeRef.current
                const progress = Math.min(elapsed / duration, 1)
                
                // Calculate how many characters should be revealed
                const revealCount = Math.floor(progress * realText.length)
                
                // Build display text: revealed chars + scrambling remaining
                const newText = realText
                    .split('')
                    .map((char, i) => {
                        if (i < revealCount) {
                            return char // Revealed
                        } else {
                            // Still scrambling - random char that changes
                            if (char === ' ') return ' '
                            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
                        }
                    })
                    .join('')
                
                setDisplayText(newText)
                
                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate)
                } else {
                    setDisplayText(realText)
                }
            }
            
            animationRef.current = requestAnimationFrame(animate)
            
            return () => {
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current)
                }
            }
        }
    }, [realText, isDecrypting, duration, isRevealed])
    
    return displayText
}

/**
 * Simpler hook for components that just need scrambled/revealed state
 */
export const useScrambledText = (text, isRevealed) => {
    if (isRevealed) return text
    return scrambleTextConsistent(text)
}
