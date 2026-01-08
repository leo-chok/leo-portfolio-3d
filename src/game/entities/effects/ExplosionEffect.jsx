import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * ExplosionEffect - Particle-based explosion effect
 * 
 * Emits spherical particles that expand outward and fade out.
 * Automatically cleans itself up after the explosion completes.
 * 
 * @param {Array} position - [x, y, z] World position of explosion
 * @param {number} scale - Overall scale multiplier (default 1.0) - main control for explosion size
 * @param {number} particleCount - Number of particles (default 30)
 * @param {number} duration - Total duration in seconds (default 1)
 * @param {Function} onComplete - Callback when explosion finishes
 */
export const ExplosionEffect = ({
    position = [0, 0, 0],
    scale = 1.0,
    particleCount = 30,
    duration = 1,
    onComplete
}) => {
    // Base values - scale multiplies these
    const BASE_SIZE = 0.15      // Base particle size
    const BASE_SPEED = 3        // Base expansion speed
    const BASE_FLARE_SIZE = 0.8 // Base central flare size
    
    // Apply scale to all visual elements
    const particleSize = BASE_SIZE * scale
    const expansionSpeed = BASE_SPEED * scale
    const flareSize = BASE_FLARE_SIZE * scale
    
    const groupRef = useRef()
    const timeRef = useRef(0)
    const [isActive, setIsActive] = useState(true)
    
    // Initialize particles with random velocities
    const particles = useMemo(() => {
        const result = []
        for (let i = 0; i < particleCount; i++) {
            // Random direction on sphere
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            
            // Random speed variation (0.5x to 1.5x)
            const speedVariation = 0.5 + Math.random()
            const speed = expansionSpeed * speedVariation
            
            // Velocity vector
            const vx = Math.sin(phi) * Math.cos(theta) * speed
            const vy = Math.sin(phi) * Math.sin(theta) * speed
            const vz = Math.cos(phi) * speed
            
            // Random size variation (0.5x to 1.5x)
            const sizeVariation = 0.5 + Math.random()
            const size = particleSize * sizeVariation
            
            // Random color - red to orange to yellow spectrum
            const hue = Math.random() * 0.12
            const saturation = 0.9
            const lightness = 0.4 + Math.random() * 0.05
            
            result.push({
                id: i,
                velocity: new THREE.Vector3(vx, vy, vz),
                size: size,
                color: new THREE.Color().setHSL(hue, saturation, lightness),
                delay: Math.random() * 0.1
            })
        }
        return result
    }, [particleCount, particleSize, expansionSpeed])
    
    // Animation loop - particles
    useFrame((state, delta) => {
        if (!isActive || !groupRef.current) return
        
        timeRef.current += delta
        const t = timeRef.current
        
        // Check if explosion is complete
        if (t >= duration) {
            setIsActive(false)
            onComplete?.()
            return
        }
        
        // Update each particle (skip first child = central flare)
        groupRef.current.children.forEach((mesh, i) => {
            if (i === 0) return // Skip central flare
            const particleIndex = i - 1
            if (!particles[particleIndex]) return
            const particle = particles[particleIndex]
            
            // Wait for delay
            const particleT = Math.max(0, t - particle.delay)
            if (particleT <= 0) {
                mesh.visible = false
                return
            }
            mesh.visible = true
            
            // Move particle along velocity
            mesh.position.copy(particle.velocity).multiplyScalar(particleT)
            
            // Scale: start at full size, shrink to zero
            const lifeProgress = particleT / (duration - particle.delay)
            const currentScale = particle.size * (1 - lifeProgress)
            mesh.scale.set(currentScale, currentScale, currentScale)
            
            // Fade out
            mesh.material.opacity = Math.max(0, 1 - lifeProgress)
        })
    })
    
    // Create gradient texture for particles
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const ctx = canvas.getContext('2d')
        
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)')
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 64, 64)
        
        const tex = new THREE.CanvasTexture(canvas)
        tex.needsUpdate = true
        return tex
    }, [])
    
    // Central flare ref
    const flareRef = useRef()
    
    // Animation loop - central flare
    useFrame(() => {
        if (!flareRef.current || !isActive) return
        
        const t = timeRef.current
        
        // Scale flare based on prop
        flareRef.current.scale.set(flareSize, flareSize, 1)
        
        // Quick flash in (0.1s), then slow fade out
        let opacity
        if (t < 0.1) {
            opacity = t / 0.1
        } else {
            const fadeProgress = (t - 0.1) / (duration - 0.1)
            opacity = 1 - fadeProgress
        }
        flareRef.current.material.opacity = Math.max(0, opacity)
    })
    
    if (!isActive) return null
    
    return (
        <group ref={groupRef} position={position}>
            {/* Central glow flash */}
            <sprite ref={flareRef} scale={[0, 0, 1]}>
                <spriteMaterial
                    map={texture}
                    color={new THREE.Color().setHSL(0.06, 1, 0.5)}
                    transparent
                    opacity={1}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
                />
            </sprite>
            
            {/* Expanding particles */}
            {particles.map((particle) => (
                <sprite key={particle.id} visible={false}>
                    <spriteMaterial
                        map={texture}
                        color={particle.color}
                        transparent
                        opacity={1}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                        toneMapped={false}
                    />
                </sprite>
            ))}
        </group>
    )
}
