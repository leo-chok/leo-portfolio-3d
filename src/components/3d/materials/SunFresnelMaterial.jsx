import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useRef, useMemo, forwardRef, useEffect } from 'react'

/**
 * SunFresnelMaterial - Special Fresnel for the Sun with transparent center
 * Allows underlying texture to show through while maintaining rim glow
 */
const SunFresnelShader = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color('#ffaa00'),
        uGlowColor: new THREE.Color('#f0b104'),
        uIntensity: .1,
        uFresnelPower: .5,
        uGlowStrength: 0.9,
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
        float pulse = 1.0 + sin(uTime * 2.0) * 0.05;
        
        // Reduced base color - let texture show through
        vec3 baseColor = uColor * uIntensity * 0.2;
        
        // Strong fresnel glow on edges
        vec3 glowEffect = uGlowColor * fresnel * uGlowStrength * pulse;
        
        // Combine
        vec3 finalColor = baseColor + glowEffect;
        
        // Alpha based on fresnel - center very transparent, edges opaque
        float alpha = fresnel * 0.9 + 0.1;
        
        gl_FragColor = vec4(finalColor, alpha);
    }
    `
)

// Extend Three.js with our custom material
extend({ SunFresnelShader })

/**
 * SunFresnelMaterial Component
 * Use this specifically for the Sun to allow texture visibility
 */
export const SunFresnelMaterial = forwardRef(({ 
    color = '#ffaa00',
    glowColor = '#ffffff',
    intensity = 1.2,
    fresnelPower = 1.5,
    glowStrength = 0.7,
    animate = true,
    ...props 
}, ref) => {
    const materialRef = useRef()
    
    // Memoize colors
    const baseColor = useMemo(() => new THREE.Color(color), [color])
    const glow = useMemo(() => new THREE.Color(glowColor), [glowColor])
    
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
            materialRef.current.uGlowColor = new THREE.Color(glowColor)
            materialRef.current.uIntensity = intensity
            materialRef.current.uFresnelPower = fresnelPower
            materialRef.current.uGlowStrength = glowStrength
        }
    }, [color, glowColor, intensity, fresnelPower, glowStrength])
    
    return (
        <sunFresnelShader
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
            {...props}
        />
    )
})

SunFresnelMaterial.displayName = 'SunFresnelMaterial'
