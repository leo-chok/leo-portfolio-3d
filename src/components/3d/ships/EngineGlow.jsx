import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSpaceshipStore } from '../../../stores/spaceshipStore'
import * as THREE from 'three'

/**
 * EngineGlow - Sprite-based engine exhaust glow
 * Uses a radial gradient texture for smooth circular glow
 * Increases intensity progressively when boosting
 * Reads isBoosting directly from store to avoid parent re-renders
 */
export const EngineGlow = ({ 
    color = '#ff9944',
    size = 0.06,
    opacity = 0.8,
    layers = 2
}) => {
    const groupRef = useRef()
    const intensityRef = useRef(1) // Current intensity (1 = normal, 1.5 = max boost)
    
    // Smooth transition for boost effect - read from store directly to avoid re-renders
    useFrame(() => {
        // Read isBoosting from store without subscribing (no re-render)
        const isBoosting = useSpaceshipStore.getState().isBoosting
        const targetIntensity = isBoosting ? 1.5 : 1
        // Lerp towards target (smooth transition)
        intensityRef.current += (targetIntensity - intensityRef.current) * 0.1
        
        // Update sprite scales
        if (groupRef.current) {
            groupRef.current.children.forEach((sprite, i) => {
                const baseSize = size * (1 + i * 0.8)
                const newSize = baseSize * intensityRef.current
                sprite.scale.set(newSize, newSize, 1)
            })
        }
    })
    
    // Create gradient texture (memoized)
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 128
        canvas.height = 128
        const ctx = canvas.getContext('2d')
        
        // Create radial gradient - bright center fading to transparent
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
        gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.9)')
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)')
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 128, 128)
        
        const tex = new THREE.CanvasTexture(canvas)
        tex.needsUpdate = true
        return tex
    }, [])
    
    // Memoize color
    const glowColor = useMemo(() => new THREE.Color(color), [color])
    
    return (
        <group ref={groupRef}>
            {/* Multiple layers for depth effect */}
            {Array.from({ length: layers }).map((_, i) => {
                const layerSize = size * (1 + i * 0.8)
                const layerOpacity = opacity / (i + 1)
                return (
                    <sprite key={i} scale={[layerSize, layerSize, 1]}>
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
