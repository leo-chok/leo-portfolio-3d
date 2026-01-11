import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRef, useMemo, forwardRef, useEffect } from 'react'

/**
 * PlanetRimMaterial - Transparent rim light for planets/moons
 * Used as overlay on top of solid MeshStandardMaterial
 * Center is fully transparent, edges glow
 */
const PlanetRimShader = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color('#4488ff'),
        uGlowColor: new THREE.Color('#ffffff'),
        uIntensity: 0.5,
        uFresnelPower: 2.5,
        uGlowStrength: 1.0,
    },
    // Vertex shader
    `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
    }
    `,
    // Fragment shader - transparent center, glowing edges
    `
    uniform vec3 uColor;
    uniform vec3 uGlowColor;
    uniform float uIntensity;
    uniform float uFresnelPower;
    uniform float uGlowStrength;
    uniform float uTime;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
        // Calculate fresnel effect (rim lighting)
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), uFresnelPower);
        
        // Subtle pulse animation
        float pulse = 1.0 + sin(uTime * 1.5) * 0.03;
        
        // Rim glow only (no base color fill)
        vec3 glowEffect = uGlowColor * fresnel * uGlowStrength * pulse * uIntensity;
        
        // Alpha based on fresnel - center fully transparent, edges visible
        float alpha = fresnel * 0.7;
        
        gl_FragColor = vec4(glowEffect, alpha);
    }
    `
)

// Extend Three.js with our custom material
extend({ PlanetRimShader })

/**
 * PlanetRimMaterial Component
 * Use this as overlay on planets/moons for rim light effect
 */
export const PlanetRimMaterial = forwardRef(({ 
    color = '#4488ff',
    glowColor = null, // null = use planet color
    intensity = 0.5,
    fresnelPower = 2.5,
    glowStrength = 1.0,
    animate = true,
    ...props 
}, ref) => {
    const materialRef = useRef()
    
    // Memoize colors
    const baseColor = useMemo(() => new THREE.Color(color), [color])
    const glow = useMemo(() => new THREE.Color(glowColor || color), [glowColor, color])
    
    // Animate time uniform for subtle pulse
    useFrame((state) => {
        if (materialRef.current && animate) {
            materialRef.current.uTime = state.clock.elapsedTime
        }
    })
    
    // Update uniforms when props change
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uColor = new THREE.Color(color)
            materialRef.current.uGlowColor = new THREE.Color(glowColor || color)
            materialRef.current.uIntensity = intensity
            materialRef.current.uFresnelPower = fresnelPower
            materialRef.current.uGlowStrength = glowStrength
        }
    }, [color, glowColor, intensity, fresnelPower, glowStrength])
    
    return (
        <planetRimShader
            ref={(el) => {
                materialRef.current = el
                if (ref) {
                    if (typeof ref === 'function') ref(el)
                    else ref.current = el
                }
            }}
            uColor={baseColor}
            uGlowColor={glow}
            uIntensity={intensity}
            uFresnelPower={fresnelPower}
            uGlowStrength={glowStrength}
            toneMapped={false}
            transparent
            depthWrite={false}
            side={THREE.FrontSide}
            {...props}
        />
    )
})

PlanetRimMaterial.displayName = 'PlanetRimMaterial'
