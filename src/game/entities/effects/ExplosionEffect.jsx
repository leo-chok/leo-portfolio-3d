import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * ExplosionEffect - Particle-based explosion effect
 * 
 * Emits spherical particles that expand outward and fade out.
 * Automatically cleans itself up after the explosion completes.
 * 
 * @param {Array} position - [x, y, z] World position of explosion
 * @param {number} particleCount - Number of particles (default 30)
 * @param {string} color - Base color of explosion (default orange)
 * @param {number} size - Base particle size (default 0.3)
 * @param {number} duration - Total duration in seconds (default 1.5)
 * @param {number} speed - Expansion speed (default 3)
 * @param {Function} onComplete - Callback when explosion finishes
 */
export const ExplosionEffect = ({
    position = [0, 0, 0],
    particleCount = 30,
    color = '#ff0000ff',
    size = 0.005,
    duration = 1,
    speed = 15,
    onComplete
}) => {
    const groupRef = useRef()
    const particlesRef = useRef([])
    const timeRef = useRef(0)
    const [isActive, setIsActive] = useState(true)
    
    // Initialize particles with random velocities
    const particles = useMemo(() => {
        const result = []
        for (let i = 0; i < particleCount; i++) {
            // Random direction on sphere
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            
            // Random speed variation
            const particleSpeed = speed * (0.5 + Math.random() * 1)
            
            // Velocity vector
            const vx = Math.sin(phi) * Math.cos(theta) * particleSpeed
            const vy = Math.sin(phi) * Math.sin(theta) * particleSpeed
            const vz = Math.cos(phi) * particleSpeed
            
            // Random size variation
            const particleSize = size * (0.5 + Math.random() * 1)
            
            // Random color variation - red to orange to yellow spectrum
            // Hue: 0.0 (red) → 0.08 (orange) → 0.12 (yellow)
            const hue = Math.random() * 0.12 // Full red-orange-yellow range
            const saturation = 0.9 // Full saturation for vibrant colors
            const lightness = 0.4 + Math.random() * 0.05 // Darker = more saturated look
            
            result.push({
                id: i,
                velocity: new THREE.Vector3(vx, vy, vz),
                position: new THREE.Vector3(0, 0, 0),
                size: particleSize,
                color: new THREE.Color().setHSL(hue, saturation, lightness),
                delay: Math.random() * 0.1, // Slight spawn delay for stagger
                rotationSpeed: (Math.random() - 0.5) * 5
            })
        }
        return result
    }, [particleCount, size, speed])
    
    // Animation loop
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
        
        // Normalized progress (0 to 1)
        const progress = t / duration
        
        // Update each particle (skip first child which is the central flare)
        groupRef.current.children.forEach((mesh, i) => {
            if (i === 0) return // Skip central flare
            const particleIndex = i - 1 // Adjust index for particles array
            if (!particles[particleIndex]) return
            const particle = particles[particleIndex]
            
            // Wait for delay
            const particleT = Math.max(0, t - particle.delay)
            if (particleT <= 0) {
                mesh.visible = false
                return
            }
            mesh.visible = true
            
            // Move particle along velocity - LINEAR motion (no gravity/return)
            mesh.position.copy(particle.velocity).multiplyScalar(particleT)
            
            // Scale: start at full size, shrink to zero
            const scaleProgress = particleT / (duration - particle.delay)
            const scale = particle.size * (1 - scaleProgress) * 0.5 // Smaller particles
            mesh.scale.set(scale, scale, scale)
            
            // Fade out
            mesh.material.opacity = Math.max(0, 1 - scaleProgress)            
        })
    })
    
    // Create gradient texture for particles
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const ctx = canvas.getContext('2d')
        
        // Radial gradient - bright center, soft edges
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
    
    // Central flare state
    const flareRef = useRef()
    
    // Update flare in animation loop - quick flash then slow fade
    useFrame((state, delta) => {
        if (!flareRef.current || !isActive) return
        
        const t = timeRef.current
        const progress = t / duration
        
        // Fixed size - just fade animation
        const flareSize = size * 6
        flareRef.current.scale.set(flareSize, flareSize, 1)
        
        // Quick flash in (0.1s), then slow fade out
        let opacity
        if (t < 0.1) {
            // Fast fade in
            opacity = t / 0.1
        } else {
            // Slow fade out over remaining duration
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
            {particles.map((particle, i) => (
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
