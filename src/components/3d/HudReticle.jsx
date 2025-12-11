import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'

const HUD_COLOR = '#00d4ff'

/**
 * HudReticle - Optimized targeting reticle
 * Simplified geometry, conditional animations
 */
export const HudReticle = ({ radius = 3.2, visible = false }) => {
    const ringRef = useRef()
    
    // Memoize corner angles
    const cornerAngles = useMemo(() => [0, 90, 180, 270].map(a => THREE.MathUtils.degToRad(a)), [])
    
    useFrame((state) => {
        if (!visible || !ringRef.current) return
        
        const time = state.clock.getElapsedTime()
        const pulse = 1 + Math.sin(time * 4) * 0.08
        ringRef.current.scale.setScalar(pulse)
    })
    
    if (!visible) return null
    
    return (
        <Billboard follow={true}>
            {/* Single outer ring - simplified */}
            <mesh ref={ringRef}>
                <ringGeometry args={[radius - 0.05, radius + 0.05, 32]} />
                <meshBasicMaterial 
                    color={HUD_COLOR}
                    transparent
                    opacity={0.5}
                    side={THREE.DoubleSide}
                    toneMapped={false}
                />
            </mesh>
            
            {/* Corner brackets */}
            {cornerAngles.map((angle, i) => (
                <mesh key={i} rotation={[0, 0, angle]}>
                    <ringGeometry args={[radius * 0.95, radius * 1.0, 4, 1, 0, Math.PI / 8]} />
                    <meshBasicMaterial 
                        color={HUD_COLOR}
                        transparent
                        opacity={0.9}
                        side={THREE.DoubleSide}
                        toneMapped={false}
                    />
                </mesh>
            ))}
        </Billboard>
    )
}
