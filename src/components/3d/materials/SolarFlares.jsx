import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * SolarFlares - Particle ejections from the sun surface
 * Creates random bursts of particles that shoot outward
 */
export const SolarFlares = ({ size = 1, color = '#ff8800', count = 50 }) => {
    const particlesRef = useRef()
    const velocitiesRef = useRef([])
    const lifetimesRef = useRef([])
    const maxLifetimesRef = useRef([])
    
    // Initialize particles
    const [positions, colors] = useMemo(() => {
        const pos = new Float32Array(count * 3)
        const col = new Float32Array(count * 3)
        const baseColor = new THREE.Color(color)
        
        velocitiesRef.current = []
        lifetimesRef.current = []
        maxLifetimesRef.current = []
        
        for (let i = 0; i < count; i++) {
            // Random position on sphere surface
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI
            const radius = size * 0.7
            
            pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
            pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
            pos[i * 3 + 2] = radius * Math.cos(phi)
            
            // Velocity (outward direction)
            const speed = 0.01 + Math.random() * 0.03
            velocitiesRef.current.push(new THREE.Vector3(
                pos[i * 3] * speed / radius,
                pos[i * 3 + 1] * speed / radius,
                pos[i * 3 + 2] * speed / radius
            ))
            
            // Random lifetime
            maxLifetimesRef.current.push(2 + Math.random() * 3)
            lifetimesRef.current.push(Math.random() * maxLifetimesRef.current[i])
            
            // Color variation (yellow to orange to red)
            const colorVar = Math.random()
            col[i * 3] = baseColor.r + colorVar * 0.2
            col[i * 3 + 1] = baseColor.g * (1 - colorVar * 0.5)
            col[i * 3 + 2] = baseColor.b * (1 - colorVar * 0.8)
        }
        
        return [pos, col]
    }, [count, size, color])
    
    // Animate particles
    useFrame((state, delta) => {
        if (!particlesRef.current) return
        
        const positions = particlesRef.current.geometry.attributes.position.array
        const colors = particlesRef.current.geometry.attributes.color.array
        
        for (let i = 0; i < count; i++) {
            // Update lifetime
            lifetimesRef.current[i] += delta
            
            // Reset if expired
            if (lifetimesRef.current[i] >= maxLifetimesRef.current[i]) {
                // Respawn at random position on sun surface
                const theta = Math.random() * Math.PI * 2
                const phi = Math.random() * Math.PI
                const radius = size * 0.7
                
                positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
                positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
                positions[i * 3 + 2] = radius * Math.cos(phi)
                
                // New velocity
                const speed = 0.02 + Math.random() * 0.03
                velocitiesRef.current[i].set(
                    positions[i * 3] * speed / radius,
                    positions[i * 3 + 1] * speed / radius,
                    positions[i * 3 + 2] * speed / radius
                )
                
                // Reset lifetime
                lifetimesRef.current[i] = 0
                maxLifetimesRef.current[i] = 2 + Math.random() * 3
            }
            
            // Move outward
            positions[i * 3] += velocitiesRef.current[i].x
            positions[i * 3 + 1] += velocitiesRef.current[i].y
            positions[i * 3 + 2] += velocitiesRef.current[i].z
            
            // Fade based on lifetime
            const lifeRatio = lifetimesRef.current[i] / maxLifetimesRef.current[i]
            const fade = 1 - lifeRatio
            
            // Update color alpha (simulated via color intensity)
            const baseR = 1.0
            const baseG = 0.6 * (1 - lifeRatio) // Fade to red
            const baseB = 0.2 * (1 - lifeRatio)
            
            colors[i * 3] = baseR * fade
            colors[i * 3 + 1] = baseG * fade
            colors[i * 3 + 2] = baseB * fade
        }
        
        particlesRef.current.geometry.attributes.position.needsUpdate = true
        particlesRef.current.geometry.attributes.color.needsUpdate = true
    })
    
    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={size * 0.08}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    )
}
