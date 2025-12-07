import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'

const HUD_COLOR = '#00d4ff' // Cyan blue

export const HudReticle = ({ radius = 3.2, visible = false }) => {
    const ringRef = useRef()
    const innerRingRef = useRef()
    
    useFrame((state) => {
        if (!visible) return
        
        const time = state.clock.getElapsedTime()
        
        // Outer ring pulsing
        if (ringRef.current) {
            const pulse = 1 + Math.sin(time * 4) * 0.08
            ringRef.current.scale.set(pulse, pulse, 1)
            ringRef.current.material.opacity = 0.3 + Math.sin(time * 3) * 0.2
        }
        
        // Inner ring counter-rotation
        if (innerRingRef.current) {
            innerRingRef.current.rotation.z = time * 0.5
            innerRingRef.current.material.opacity = 0.5 + Math.sin(time * 5) * 0.3
        }
    })
    
    if (!visible) return null
    
    return (
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
            {/* Outer pulsing ring */}
            <mesh ref={ringRef}>
                <ringGeometry args={[radius - 0.05, radius + 0.05, 64]} />
                <meshBasicMaterial 
                    color={HUD_COLOR}
                    transparent
                    opacity={0.5}
                    side={THREE.DoubleSide}
                    toneMapped={false}
                />
            </mesh>
            
            {/* Inner targeting ring with dashes */}
            <mesh ref={innerRingRef}>
                <ringGeometry args={[radius * 0.85, radius * 0.88, 32]} />
                <meshBasicMaterial 
                    color={HUD_COLOR}
                    transparent
                    opacity={0.7}
                    side={THREE.DoubleSide}
                    toneMapped={false}
                />
            </mesh>
            
            {/* Corner brackets for "targeting" effect */}
            {[0, 90, 180, 270].map((angle, i) => (
                <mesh 
                    key={i} 
                    rotation={[0, 0, THREE.MathUtils.degToRad(angle)]}
                >
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
