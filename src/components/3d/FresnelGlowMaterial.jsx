import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRef, useMemo, forwardRef } from 'react'

/**
 * FresnelGlowMaterial - Rim light effect for sci-fi glow without bloom
 * Creates edge lighting effect that's performant and visually striking
 */
const FresnelGlowShader = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color('#7cc4ed'),
        uGlowColor: new THREE.Color('#7cc4ed'),
        uIntensity: 2.0,
        uFresnelPower: 2.5,
        uGlowStrength: 0.5,
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
    // Fragment shader
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
        float pulse = 1.0 + sin(uTime * 2.0) * 0.05;
        
        // Base color with intensity
        vec3 baseColor = uColor * uIntensity;
        
        // Add fresnel glow
        vec3 glowEffect = uGlowColor * fresnel * uGlowStrength * pulse;
        
        // Combine
        vec3 finalColor = baseColor + glowEffect;
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
    `
)

// Extend Three.js with our custom material
extend({ FresnelGlowShader })

/**
 * FresnelGlowMaterial Component
 * Use this in place of meshBasicMaterial for glowing celestial bodies
 */
export const FresnelGlowMaterial = forwardRef(({ 
    color = '#7cc4ed',
    glowColor,
    intensity = 1.5,
    fresnelPower = 2.5,
    glowStrength = 0.6,
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
    
    return (
        <fresnelGlowShader
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
            {...props}
        />
    )
})

FresnelGlowMaterial.displayName = 'FresnelGlowMaterial'
