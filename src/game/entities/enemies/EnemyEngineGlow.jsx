import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * EnemyEngineGlow - Purple engine glow for enemy ships
 * 
 * Dynamic intensity based on speed passed from parent.
 * Violet/purple color for enemy identification.
 */
export const EnemyEngineGlow = ({ 
    color = '#aa00ff', // Violet/purple
    size = 0.08,
    opacity = 0.9,
    layers = 2,
    speedRef // Ref to current speed from parent
}) => {
    const groupRef = useRef()
    const intensityRef = useRef(0.5)
    const timeRef = useRef(0)
    
    useFrame((state, delta) => {
        // Get speed from ref
        const speed = speedRef?.current || 0
        const maxSpeed = 10
        
        // Calculate target intensity based on speed (0.4 to 1.5)
        const speedFactor = Math.min(speed / maxSpeed, 1)
        const targetIntensity = 0.4 + speedFactor * 1.1
        
        // Lerp towards target
        intensityRef.current += (targetIntensity - intensityRef.current) * 0.1
        
        // Flicker effect
        timeRef.current += delta * (5 + speedFactor * 10)
        const flicker = 1 + Math.sin(timeRef.current) * 0.1
        const flicker2 = 1 + Math.sin(timeRef.current * 1.5 + 1) * 0.06
        
        // Update sprites
        if (groupRef.current) {
            groupRef.current.children.forEach((sprite, i) => {
                const layerFlicker = i === 0 ? flicker : flicker2
                const baseSize = size * (1 + i * 0.7)
                const newSize = baseSize * intensityRef.current * layerFlicker
                sprite.scale.set(newSize, newSize, 1)
                
                const baseOpacity = opacity / (i + 1)
                sprite.material.opacity = baseOpacity * intensityRef.current * layerFlicker
            })
        }
    })
    
    // Create gradient texture
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 128
        canvas.height = 128
        const ctx = canvas.getContext('2d')
        
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
    
    const glowColor = useMemo(() => new THREE.Color(color), [color])
    
    return (
        <group ref={groupRef}>
            {Array.from({ length: layers }).map((_, i) => {
                const layerSize = size * (1 + i * 0.7)
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
