import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Line, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { useWindowStore } from '../../stores/windowStore'
import { useDecryptingText } from '../../utils/textUtils'

const HUD_COLOR = '#00d4ff'

// Pre-allocated reusable arrays (outside component to avoid GC)
const ORIGIN = [0, 0, 0]

export const HudCallout = ({ name, sectionId, visible = false, offset = [4, 3, 0] }) => {
    const lineRef = useRef()
    const textRef = useRef()
    const [drawProgress, setDrawProgress] = useState(0)
    const [showText, setShowText] = useState(false)
    
    // Get analysis state from store
    const analyzedSections = useWindowStore((state) => state.analyzedSections)
    const decryptingSection = useWindowStore((state) => state.decryptingSection)
    const loadingProgress = useWindowStore((state) => state.loadingProgress)
    
    const isAnalyzed = sectionId ? analyzedSections.has(sectionId) : false
    const isDecrypting = sectionId && decryptingSection === sectionId
    
    // Calculate duration based on loading progress (sync with loading bar)
    const decryptDuration = 500 // ms
    
    // Use decrypting text hook
    const displayName = useDecryptingText(name, isDecrypting, decryptDuration, isAnalyzed)
    
    // Memoize offset-dependent calculations
    const midPoint = useMemo(() => [offset[0] * 0.3, offset[1] * 0.6, 0], [offset[0], offset[1]])
    
    // Memoize underline points (only changes when name changes)
    const underlinePoints = useMemo(() => [[0, -0.3, 0], [name.length * 0.4, -0.3, 0]], [name.length])
    
    // Animation timeline
    useEffect(() => {
        let tween = null
        
        if (visible) {
            // Reset and animate
            setDrawProgress(0)
            setShowText(false)
            
            // Animate line drawing
            tween = gsap.to({ progress: 0 }, {
                progress: 1,
                duration: 0.4,
                ease: 'power2.out',
                onUpdate: function() {
                    setDrawProgress(this.targets()[0].progress)
                },
                onComplete: () => {
                    setShowText(true)
                }
            })
        } else {
            // Quick reset
            setDrawProgress(0)
            setShowText(false)
        }
        
        // Cleanup - kill animation when visibility changes
        return () => {
            if (tween) {
                tween.kill()
            }
            setDrawProgress(0)
            setShowText(false)
        }
    }, [visible])
    
    useFrame((state) => {
        if (!visible) return
        
        // Subtle text pulse
        if (textRef.current && showText) {
            const time = state.clock.getElapsedTime()
            textRef.current.material.opacity = 0.8 + Math.sin(time * 3) * 0.2
        }
    })
    
    // Memoize line points calculation (only recalculates when drawProgress changes)
    const linePoints = useMemo(() => {
        if (drawProgress === 0) return [ORIGIN, ORIGIN]
        
        const progress = drawProgress
        const t1 = Math.min(progress * 2, 1)
        
        const currentMid = [
            midPoint[0] * t1,
            midPoint[1] * t1,
            0
        ]
        
        if (progress <= 0.5) {
            return [ORIGIN, currentMid]
        }
        
        const t2 = (progress - 0.5) * 2
        const currentEnd = [
            midPoint[0] + (offset[0] - midPoint[0]) * t2,
            midPoint[1] + (offset[1] - midPoint[1]) * t2,
            0
        ]
        
        return [ORIGIN, midPoint, currentEnd]
    }, [drawProgress, midPoint, offset])
    
    if (!visible && drawProgress === 0) return null
    
    return (
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
            {/* Animated callout line */}
            {drawProgress > 0 && (
                <Line
                    ref={lineRef}
                    points={linePoints}
                    color={HUD_COLOR}
                    lineWidth={2}
                    transparent
                    opacity={0.8}
                    toneMapped={false}
                />
            )}
            
            {/* Label */}
            {showText && (
                <group position={offset}>
                    {/* Underline */}
                    <Line
                        points={underlinePoints}
                        color={HUD_COLOR}
                        lineWidth={1}
                        transparent
                        opacity={0.6}
                        toneMapped={false}
                    />
                    
                    {/* Text label */}
                    <Text
                        ref={textRef}
                        fontSize={0.6}
                        color={HUD_COLOR}
                        anchorX="left"
                        anchorY="bottom"
                        font="/fonts/Orbitron-Bold.ttf"
                        letterSpacing={0.1}
                    >
                        {displayName}
                        <meshBasicMaterial 
                            color={HUD_COLOR} 
                            transparent 
                            opacity={1}
                            toneMapped={false}
                        />
                    </Text>
                    
                    {/* Small dot at connection point */}
                    <mesh position={[-0.1, -0.1, 0]}>
                        <circleGeometry args={[0.08, 16]} />
                        <meshBasicMaterial 
                            color={HUD_COLOR}
                            toneMapped={false}
                        />
                    </mesh>
                </group>
            )}
        </Billboard>
    )
}
