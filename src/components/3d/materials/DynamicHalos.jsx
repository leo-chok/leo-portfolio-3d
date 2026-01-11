import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * DynamicHalos - Multiple rotating/pulsing halo layers for heat wave effect
 * Each layer rotates at different speeds and has varying opacity
 */
export const DynamicHalos = ({ size = 1, color = '#ff6600', layers = 4 }) => {
    const groupRef = useRef()
    const layerRefs = useRef([])
    
    // Animate halos
    useFrame((state) => {
        const time = state.clock.elapsedTime
        
        layerRefs.current.forEach((ref, i) => {
            if (!ref) return
            
            // Each layer rotates at different speed and direction
            const speed = 0.1 + i * 0.05
            const direction = i % 2 === 0 ? 1 : -1
            ref.rotation.z = time * speed * direction
            
            // Pulse opacity
            const pulse = 0.3 + Math.sin(time * (0.5 + i * 0.2)) * 0.15
            if (ref.material) {
                ref.material.opacity = pulse
            }
            
            // Slight scale pulsing
            const scalePulse = 1 + Math.sin(time * 0.3 + i) * 0.02
            ref.scale.setScalar(scalePulse)
        })
    })
    
    // Create halo layers
    const haloLayers = []
    for (let i = 0; i < layers; i++) {
        const layerSize = size * (1.1 + i * 0.15)
        const opacity = 0.4 - i * 0.08
        
        // Color gradient - inner layers more yellow, outer more orange/red
        const colorHue = new THREE.Color(color)
        const layerColor = colorHue.clone()
        layerColor.offsetHSL(i * 0.02, 0, -i * 0.05) // Shift hue slightly, darken
        
        haloLayers.push(
            <mesh
                key={i}
                ref={el => layerRefs.current[i] = el}
                rotation={[Math.PI / 2, 0, i * 0.5]}
            >
                <ringGeometry args={[layerSize * 0.9, layerSize, 64]} />
                <meshBasicMaterial
                    color={layerColor}
                    transparent
                    opacity={opacity}
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
        )
    }
    
    return (
        <group ref={groupRef}>
            {haloLayers}
        </group>
    )
}
