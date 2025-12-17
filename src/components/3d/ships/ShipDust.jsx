import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSpaceshipStore } from '../../../stores/spaceshipStore'
import * as THREE from 'three'

/**
 * ShipDust - Particle system for spaceship speed effect
 * 
 * Particles spawn ahead of the ship and fly towards/past it
 * Number of visible particles based on speed:
 * - 0-100 km/h: 0 particles
 * - 100-500 km/h: 10 particles
 * - 500-800 km/h: 20 particles
 * - 800-1117 km/h: 30 particles
 */
export const ShipDust = ({ shipRef }) => {
    const pointsRef = useRef()
    
    // Configuration
    const config = useMemo(() => ({
        maxParticleCount: 30,
        spawnDistance: -1,       // In front of ship (negative Z)
        despawnDistance: 0.5,      // Behind ship (positive Z)
        baseSpeed: 1,
        boostSpeedMultiplier: 2.5,
        spreadRadius: 30,
        particleSize: 0.01,
    }), [])
    
    // Get visible particle count based on speed
    const getVisibleParticleCount = (speed) => {
        if (speed < 100) return 0
        if (speed < 500) return 10
        if (speed < 800) return 20
        return 30
    }
    
    // Initialize particle positions and velocities
    const { positions, velocities, geometry } = useMemo(() => {
        const positions = new Float32Array(config.maxParticleCount * 3)
        const velocities = []
        
        for (let i = 0; i < config.maxParticleCount; i++) {
            // Spawn ahead of ship
            const angle = Math.random() * Math.PI * 2
            const radius = Math.random() * config.spreadRadius
            
            positions[i * 3] = Math.cos(angle) * radius
            positions[i * 3 + 1] = Math.sin(angle) * radius
            positions[i * 3 + 2] = config.spawnDistance - Math.random() * 10
            
            velocities.push({
                z: config.baseSpeed + Math.random() * 20
            })
        }
        
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        
        return { positions, velocities, geometry }
    }, [config])
    
    // Animate particles
    useFrame((state, delta) => {
        if (!pointsRef.current) return
        
        // Read speed directly from store to avoid re-renders
        const speed = useSpaceshipStore.getState().speed
        const isBoosting = useSpaceshipStore.getState().isBoosting
        
        const positionAttribute = pointsRef.current.geometry.attributes.position
        const speedMultiplier = isBoosting ? config.boostSpeedMultiplier : 1
        
        // Set how many particles to draw based on speed
        const visibleCount = getVisibleParticleCount(speed)
        pointsRef.current.geometry.setDrawRange(0, visibleCount)
        
        // Only update visible particles
        for (let i = 0; i < visibleCount; i++) {
            // Move particle towards back of ship (positive Z)
            const currentZ = positionAttribute.array[i * 3 + 2]
            const newZ = currentZ + velocities[i].z * speedMultiplier * delta
            
            // Respawn when behind ship
            if (newZ > config.despawnDistance) {
                const angle = Math.random() * Math.PI * 2
                const radius = Math.random() * config.spreadRadius
                
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
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        })
    }, [config.particleSize])
    
    return (
        <points ref={pointsRef} geometry={geometry} material={material} />
    )
}
