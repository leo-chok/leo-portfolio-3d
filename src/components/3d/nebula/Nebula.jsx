import { useMemo } from 'react'
import { NebulaCloud } from './NebulaCloud'

/**
 * Nebula - Cosmic nebula background effect
 * 
 * Creates multiple layered cloud sprites with different colors
 * to simulate a colorful space nebula in the background
 * 
 * Positioned far from the scene center for depth effect
 */
export const Nebula = ({
    distance = 8000,        // Distance from center
    cloudCount = 20,         // Number of cloud sprites
    baseSize = 8000,         // Base size of clouds
    sizeVariation = 0.5,    // Size randomness (0-1)
    colors = ['#ff66aa', '#6688ff', '#44ffaa', '#ffaa44'], // Color palette
    opacity = 0.05,
    spread = 300,          // Spread around the distance sphere
}) => {
    // Seeded pseudo-random number generator for consistent positions
    // Uses a simple but effective hash function
    const seededRandom = (seed) => {
        const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123
        return x - Math.floor(x)
    }
    
    // Generate cloud configurations with fixed seed (no dependencies that change)
    const clouds = useMemo(() => {
        const cloudConfigs = []
        
        for (let i = 0; i < cloudCount; i++) {
            // Use index-based seeds for reproducible random values
            const seed1 = seededRandom(i * 1.1 + 0.1)
            const seed2 = seededRandom(i * 2.2 + 0.2)
            const seed3 = seededRandom(i * 3.3 + 0.3)
            const seed4 = seededRandom(i * 4.4 + 0.4)
            const seed5 = seededRandom(i * 5.5 + 0.5)
            const seed6 = seededRandom(i * 6.6 + 0.6)
            const seed7 = seededRandom(i * 7.7 + 0.7)
            
            // Random position on a sphere at 'distance' radius
            const theta = seed1 * Math.PI * 2
            const phi = Math.acos(2 * seed2 - 1)
            
            // Add some spread variation
            const r = distance + (seed3 - 0.5) * spread
            
            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)
            
            // Random size
            const size = baseSize * (1 + (seed4 - 0.5) * sizeVariation * 2)
            
            // Random color from palette
            const color = colors[Math.floor(seed5 * colors.length)]
            
            // Random spin on its own axis (after lookAt)
            const spinAngle = seed6 * Math.PI * 2
            
            // Random opacity variation
            const cloudOpacity = opacity * (0.7 + seed7 * 0.6)
            
            cloudConfigs.push({
                id: i,
                position: [x, y, z],
                size,
                color,
                spinAngle,
                opacity: cloudOpacity,
                seed: i * 17 + Math.floor(seed1 * 1000)  // Unique seed per cloud
            })
        }
        
        return cloudConfigs
    }, [cloudCount, distance, spread, baseSize, sizeVariation, colors, opacity])
    
    return (
        <group>
            {clouds.map(cloud => (
                <NebulaCloud
                    key={cloud.id}
                    position={cloud.position}
                    size={cloud.size}
                    color={cloud.color}
                    spinAngle={cloud.spinAngle}
                    opacity={cloud.opacity}
                    seed={cloud.seed}
                />
            ))}
        </group>
    )
}
