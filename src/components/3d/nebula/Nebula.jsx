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
    // Generate cloud configurations
    const clouds = useMemo(() => {
        const cloudConfigs = []
        
        for (let i = 0; i < cloudCount; i++) {
            // Random position on a sphere at 'distance' radius
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            
            // Add some spread variation
            const r = distance + (Math.random() - 0.5) * spread
            
            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)
            
            // Random size
            const size = baseSize * (1 + (Math.random() - 0.5) * sizeVariation * 2)
            
            // Random color from palette
            const color = colors[Math.floor(Math.random() * colors.length)]
            
            // Random spin on its own axis (after lookAt)
            const spinAngle = Math.random() * Math.PI * 2
            
            // Random opacity variation
            const cloudOpacity = opacity * (0.7 + Math.random() * 0.6)
            
            cloudConfigs.push({
                id: i,
                position: [x, y, z],
                size,
                color,
                spinAngle,
                opacity: cloudOpacity,
                seed: i * 17 + Math.floor(Math.random() * 1000)  // Unique seed per cloud
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
