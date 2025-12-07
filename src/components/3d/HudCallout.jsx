import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Line, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

const HUD_COLOR = '#00d4ff'

export const HudCallout = ({ name, visible = false, offset = [4, 3, 0] }) => {
    const lineRef = useRef()
    const textRef = useRef()
    const [drawProgress, setDrawProgress] = useState(0)
    const [showText, setShowText] = useState(false)
    
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
    
    if (!visible && drawProgress === 0) return null
    
    // Calculate line points based on draw progress
    const startPoint = [0, 0, 0]
    const midPoint = [offset[0] * 0.3, offset[1] * 0.6, 0]
    const endPoint = offset
    
    // Interpolate points based on progress
    const currentMid = [
        startPoint[0] + (midPoint[0] - startPoint[0]) * Math.min(drawProgress * 2, 1),
        startPoint[1] + (midPoint[1] - startPoint[1]) * Math.min(drawProgress * 2, 1),
        0
    ]
    
    const currentEnd = drawProgress > 0.5 ? [
        midPoint[0] + (endPoint[0] - midPoint[0]) * ((drawProgress - 0.5) * 2),
        midPoint[1] + (endPoint[1] - midPoint[1]) * ((drawProgress - 0.5) * 2),
        0
    ] : currentMid
    
    const linePoints = drawProgress <= 0.5 
        ? [startPoint, currentMid]
        : [startPoint, midPoint, currentEnd]
    
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
                        points={[[0, -0.3, 0], [name.length * 0.4, -0.3, 0]]}
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
                        {name}
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
