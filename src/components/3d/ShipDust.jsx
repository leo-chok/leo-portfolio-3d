import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSpaceshipStore } from '../../stores/spaceshipStore'
import * as THREE from 'three'

/**
 * ShipDust - Particle system for spaceship speed effect
 * 
 * Particles spawn ahead of the ship and fly towards/past it
 * Speed increases with boost for more intense effect
 */
export const ShipDust = ({ shipRef }) => {
    const pointsRef = useRef()
    
    // Get speed and boost state from store
    const speed = useSpaceshipStore(state => state.speed)
    const isBoosting = useSpaceshipStore(state => state.isBoosting)
    
    // Configuration - optimized for small ship scale
    // Ship faces -Z direction (rotated 180°), so "ahead" is negative Z
    const config = useMemo(() => ({
        particleCount: 15,
        spawnDistance: -0.2,       // In front of ship (negative Z)
        despawnDistance: .5,      // Behind ship (positive Z)
        baseSpeed: 1,            // Slower for small scale
        boostSpeedMultiplier: 2.5,
        spreadRadius: 30,       // Tight spread
        particleSize: 0.005,      // Very small
    }), [])
    
    // Initialize particle positions and velocities
    const { positions, velocities, geometry } = useMemo(() => {
        const positions = new Float32Array(config.particleCount * 3)
        const velocities = []
        
        for (let i = 0; i < config.particleCount; i++) {
            // Spawn in a cylinder ahead of ship (negative Z)
            const angle = Math.random() * Math.PI * 2
            const radius = Math.random() * config.spreadRadius
            
            positions[i * 3] = Math.cos(angle) * radius      // X
            positions[i * 3 + 1] = Math.sin(angle) * radius  // Y
            positions[i * 3 + 2] = config.spawnDistance - Math.random() * 20  // Z (ahead = negative)
            
            velocities.push({
                z: config.baseSpeed + Math.random() * 20  // Move toward ship (positive = toward back)
            })
        }
        
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        
        return { positions, velocities, geometry }
    }, [config])
    
    // Animate particles
    useFrame((state, delta) => {
        if (!pointsRef.current) return
        
        const positionAttribute = pointsRef.current.geometry.attributes.position
        const speedMultiplier = isBoosting ? config.boostSpeedMultiplier : 1
        
        // Scale effect based on ship speed (more visible at higher speeds)
        const visibilityMultiplier = Math.min(speed / 20, 1)
        
        for (let i = 0; i < config.particleCount; i++) {
            // Move particle towards back of ship (positive Z)
            const currentZ = positionAttribute.array[i * 3 + 2]
            const newZ = currentZ + velocities[i].z * speedMultiplier * delta
            
            // Check if particle passed the ship (reached despawn behind ship)
            if (newZ > config.despawnDistance) {
                // Respawn ahead (negative Z)
                const angle = Math.random() * Math.PI * 2
                const radius = Math.random() * config.spreadRadius * visibilityMultiplier
                
                positionAttribute.array[i * 3] = Math.cos(angle) * radius
                positionAttribute.array[i * 3 + 1] = Math.sin(angle) * radius
                positionAttribute.array[i * 3 + 2] = config.spawnDistance - Math.random() * 10
            } else {
                positionAttribute.array[i * 3 + 2] = newZ
            }
        }
        
        positionAttribute.needsUpdate = true
    })
    
    // Material with additive blending for glow effect
    const material = useMemo(() => {
        return new THREE.PointsMaterial({
            color: '#a0d8ff',
            size: config.particleSize,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        })
    }, [config.particleSize])
    
    return (
        <points ref={pointsRef} geometry={geometry} material={material} />
    )
}
