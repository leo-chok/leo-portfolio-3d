import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Line } from '@react-three/drei'
import * as THREE from 'three'

const HUD_COLOR = '#00d4ff'

/**
 * HudReticle - Minimalist Sci-Fi Targeting Reticle
 * Just 4 thick arc segments that rotate slowly
 */
export const HudReticle = ({ radius = 3.2, visible = false }) => {
    const groupRef = useRef()
    
    // Slow rotation animation
    useFrame((state) => {
        if (!visible || !groupRef.current) return
        const time = state.clock.getElapsedTime()
        groupRef.current.rotation.z = time * 0.15 // Very slow rotation
    })
    
    // Generate 4 arc segments (evenly distributed around the circle)
    const arcSegments = useMemo(() => {
        const arcs = []
        const arcLength = Math.PI / 4 // 45 degrees each
        const gapBetween = Math.PI / 2 - arcLength // Space between arcs
        
        for (let i = 0; i < 4; i++) {
            const startAngle = i * (Math.PI / 2) + gapBetween / 2
            const points = []
            const segmentCount = 16
            
            for (let j = 0; j <= segmentCount; j++) {
                const angle = startAngle + (j / segmentCount) * arcLength
                points.push(new THREE.Vector3(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    0
                ))
            }
            arcs.push(points)
        }
        return arcs
    }, [radius])
    
    // Small dots at the corners (where arcs meet)
    const cornerDots = useMemo(() => {
        return [0, Math.PI / 2, Math.PI, Math.PI * 1.5].map(angle => (
            new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            )
        ))
    }, [radius])
    
    if (!visible) return null
    
    return (
        <Billboard follow={true}>
            <group ref={groupRef}>
                {/* 4 thick arc segments */}
                {arcSegments.map((points, i) => (
                    <Line
                        key={`arc-${i}`}
                        points={points}
                        color={HUD_COLOR}
                        lineWidth={3}
                        transparent
                        opacity={0.85}
                    />
                ))}
                
                {/* Small dots at corners */}
                {cornerDots.map((pos, i) => (
                    <mesh key={`dot-${i}`} position={pos}>
                        <circleGeometry args={[radius * 0.025, 8]} />
                        <meshBasicMaterial 
                            color={HUD_COLOR}
                            transparent
                            opacity={0.9}
                            toneMapped={false}
                        />
                    </mesh>
                ))}
            </group>
        </Billboard>
    )
}
