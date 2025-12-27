import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSpaceshipStore } from '../../../stores/spaceshipStore'
import * as THREE from 'three'

/**
 * EngineGlow - Sprite-based engine exhaust glow
 * Uses a radial gradient texture for smooth circular glow
 * Increases intensity progressively when boosting
 * 
 * Props:
 * - fixedIntensity: If provided, uses this fixed intensity (0.3-1.5) instead of player speed
 *   Use this for NPCs like Mothership to decouple from player's boost state
 */
export const EngineGlow = ({ 
    color = '#ff9944',
    size = 0.06,
    opacity = 0.8,
    layers = 2,
    fixedIntensity = null // If set, use fixed intensity instead of player speed
}) => {
    const groupRef = useRef()
    const intensityRef = useRef(fixedIntensity ?? 0.3) // Current intensity (0.3 = idle, 1.5 = max speed)
    const timeRef = useRef(0)
    
    // Max speed for scaling
    const MAX_SPEED = 1117
    
    // Smooth transition for glow effect based on speed + flicker effect
    useFrame((state, delta) => {
        let targetIntensity
        
        if (fixedIntensity !== null) {
            // Use fixed intensity for NPCs
            targetIntensity = fixedIntensity
        } else {
            // Read speed from store without subscribing (no re-render)
            const speed = useSpaceshipStore.getState().speed
            
            // Calculate target intensity based on speed (0.3 to 1.5)
            const speedFactor = Math.min(speed / MAX_SPEED, 1)
            targetIntensity = 0.3 + speedFactor * 1.2
        }
        
        // Lerp towards target (smooth transition)
        intensityRef.current += (targetIntensity - intensityRef.current) * 0.1
        
        // Flicker/pulse effect
        const speedFactor = fixedIntensity !== null 
            ? (fixedIntensity - 0.3) / 1.2 
            : Math.min(useSpaceshipStore.getState().speed / MAX_SPEED, 1)
        timeRef.current += delta * (5 + speedFactor * 15) // Speed up flicker with velocity
        const flicker = 1 + Math.sin(timeRef.current) * 0.08 * (0.3 + speedFactor * 0.7)
        const flicker2 = 1 + Math.sin(timeRef.current * 1.7 + 1) * 0.05 * speedFactor
        
        // Update sprite scales and opacity with flicker
        if (groupRef.current) {
            groupRef.current.children.forEach((sprite, i) => {
                const layerFlicker = i === 0 ? flicker : flicker2
                const baseSize = size * (1 + i * 0.8)
                const newSize = baseSize * intensityRef.current * layerFlicker
                sprite.scale.set(newSize, newSize, 1)
                
                // Update opacity based on intensity with subtle flicker
                const baseOpacity = opacity / (i + 1)
                sprite.material.opacity = baseOpacity * intensityRef.current * layerFlicker
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
