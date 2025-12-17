import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'

/**
 * NebulaCloud - Single nebula cloud with procedural noise texture
 * 
 * Uses a fixed-orientation plane that faces the scene center
 * for realistic massive distant object appearance
 */
export const NebulaCloud = ({ 
    position = [0, 0, 0],
    color = '#ff66aa',
    size = 500,
    opacity = 0.15,
    spinAngle = 0,  // Random spin on its own axis (Z)
    seed = 0  // Random seed for unique noise pattern
}) => {
    const meshRef = useRef()
    
    // Make the plane face the center (0, 0, 0)
    useEffect(() => {
        if (meshRef.current) {
            // LookAt center
            meshRef.current.lookAt(0, 0, 0)
            // Apply random spin on its own axis
            meshRef.current.rotateZ(spinAngle)
        }
    }, [position, spinAngle])
    
    // Generate procedural nebula texture with unique seed
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas')
        const resolution = 256
        canvas.width = resolution
        canvas.height = resolution
        const ctx = canvas.getContext('2d')
        
        const centerX = resolution / 2
        const centerY = resolution / 2
        const maxRadius = resolution / 2
        
        // Create soft radial gradient base
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, maxRadius
        )
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)')
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)')
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.15)')
        gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.05)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, resolution, resolution)
        
        // Add noise for cloud-like appearance (seeded)
        const imageData = ctx.getImageData(0, 0, resolution, resolution)
        const data = imageData.data
        
        // Better seeded random - produces very different values per seed
        const hash = (n) => {
            const x = Math.sin(n) * 43758.5453123
            return x - Math.floor(x)
        }
        
        // Generate unique frequencies and phases for this seed
        const s = seed + 1  // Avoid seed 0 issues
        const freq1 = 0.02 + hash(s * 1.1) * 0.04
        const freq2 = 0.04 + hash(s * 2.2) * 0.06
        const freq3 = 0.08 + hash(s * 3.3) * 0.08
        const phase1 = hash(s * 4.4) * Math.PI * 2
        const phase2 = hash(s * 5.5) * Math.PI * 2
        const phase3 = hash(s * 6.6) * Math.PI * 2
        const scaleX = 0.8 + hash(s * 7.7) * 0.4  // Stretch/squash pattern
        const scaleY = 0.8 + hash(s * 8.8) * 0.4
        
        for (let i = 0; i < data.length; i += 4) {
            const px = (i / 4) % resolution
            const py = Math.floor((i / 4) / resolution)
            
            // Normalized and scaled coordinates
            const x = (px - centerX) * scaleX
            const y = (py - centerY) * scaleY
            
            // Multiple octaves of noise with seed-unique parameters
            const n1 = Math.sin(x * freq1 + phase1) * Math.cos(y * freq1 + phase2)
            const n2 = Math.sin(x * freq2 + y * freq2 * 0.5 + phase2) * 0.7
            const n3 = Math.cos(x * freq3 * 0.8 + y * freq3 + phase3) * 0.5
            
            // Seeded per-pixel random for grain
            const grain = hash(px * 12.9898 + py * 78.233 + s * 43.758) * 0.3
            
            const noise = n1 * 0.4 + n2 * 0.3 + n3 * 0.2 + grain
            
            // Modulate alpha with noise
            const alpha = data[i + 3]
            data[i + 3] = Math.max(0, Math.min(255, alpha * (0.5 + noise * 0.8)))
        }
        
        ctx.putImageData(imageData, 0, 0)
        
        const tex = new THREE.CanvasTexture(canvas)
        tex.needsUpdate = true
        return tex
    }, [seed])
    
    const nebulaColor = useMemo(() => new THREE.Color(color), [color])
    
    return (
        <mesh 
            ref={meshRef}
            position={position}
        >
            <planeGeometry args={[size, size]} />
            <meshBasicMaterial
                map={texture}
                color={nebulaColor}
                transparent
                opacity={opacity}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
                toneMapped={false}
            />
        </mesh>
    )
}
