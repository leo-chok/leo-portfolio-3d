import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * GlowHalo Component - Sprite-based glow effect
 * Uses a radial gradient texture to create a halo behind celestial bodies
 * Much more performant than bloom post-processing
 */
export const GlowHalo = ({ 
    color = '#7cc4ed',
    size = 5,
    opacity = 0.6,
    layers = 2 
}) => {
    // Create gradient texture (memoized)
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const ctx = canvas.getContext('2d')
        
        // Create radial gradient
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)')
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)')
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 256, 256)
        
        const tex = new THREE.CanvasTexture(canvas)
        tex.needsUpdate = true
        return tex
    }, [])
    
    // Memoize color
    const glowColor = useMemo(() => new THREE.Color(color), [color])
    
    return (
        <group>
            {/* Multiple layers for depth */}
            {Array.from({ length: layers }).map((_, i) => {
                const layerSize = size * (1 + i * 0.5)
                const layerOpacity = opacity / (i + 1)
                return (
                    <sprite key={i} scale={[layerSize, layerSize, 1]} renderOrder={-1}>
                        <spriteMaterial
                            map={texture}
                            color={glowColor}
                            transparent
                            opacity={layerOpacity}
                            blending={THREE.AdditiveBlending}
                            depthWrite={false}
                            toneMapped={false}
                        />
                    </sprite>
                )
            })}
        </group>
    )
}
