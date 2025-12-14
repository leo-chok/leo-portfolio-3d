import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * MilkyWay - A tilted disk of colorful stars simulating the galactic plane
 * 
 * Creates a ring/disk of stars with realistic colors:
 * - Blue (hot young stars)
 * - White (main sequence)
 * - Red/Orange (cooler older stars)
 */
export const MilkyWay = ({ 
    count = 8000,
    innerRadius = 200,
    outerRadius = 600,
    thickness = 200,  // Vertical spread of the disk
    tilt = { x: 60, z: 30 }  // Degrees - different from solar system plane
}) => {
    const pointsRef = useRef()
    
    // Generate star positions and colors
    const { positions, colors, sizes } = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        const sizes = new Float32Array(count)
        
        // Star color palette (realistic stellar colors)
        const starColors = [
            new THREE.Color('#aaccff'),  // Blue-white (hot)
            new THREE.Color('#ffffff'),  // Pure white
            new THREE.Color('#fffaf0'),  // Warm white
            new THREE.Color('#ffd699'),  // Yellow-orange
            new THREE.Color('#ffaa88'),  // Orange-red (cool)
            new THREE.Color('#88ccff'),  // Light blue
        ]
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            
            // Random angle around the disk
            const angle = Math.random() * Math.PI * 2
            
            // Random radius with more density towards center (realistic)
            const radiusRandom = Math.random()
            const radius = innerRadius + (outerRadius - innerRadius) * Math.pow(radiusRandom, 0.7)
            
            // Position in disk plane
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            
            // Vertical spread (thinner at edges, thicker near center)
            const verticalSpread = thickness * (1 - radiusRandom * 0.5)
            const y = (Math.random() - 0.5) * verticalSpread
            
            positions[i3] = x
            positions[i3 + 1] = y
            positions[i3 + 2] = z
            
            // Random star color from palette
            const color = starColors[Math.floor(Math.random() * starColors.length)]
            colors[i3] = color.r
            colors[i3 + 1] = color.g
            colors[i3 + 2] = color.b
            
            // Random size (smaller stars more common)
            sizes[i] = 0.5 + Math.random() * 1.5
        }
        
        return { positions, colors, sizes }
    }, [count, innerRadius, outerRadius, thickness])
    
    // Convert tilt to radians
    const tiltRad = {
        x: (tilt.x * Math.PI) / 180,
        z: (tilt.z * Math.PI) / 180
    }
    
    return (
        <group rotation={[tiltRad.x, 0, tiltRad.z]}>
            <points ref={pointsRef}>
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
                    <bufferAttribute
                        attach="attributes-size"
                        count={count}
                        array={sizes}
                        itemSize={1}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={1.5}
                    vertexColors
                    transparent
                    opacity={0.8}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    )
}
