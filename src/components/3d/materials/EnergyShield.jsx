import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * EnergyShieldMaterial - Hexagonal energy shield shader
 * Features:
 * - Animated hexagonal pattern
 * - Fresnel edge glow
 * - Pulsing energy waves
 * - Proximity-based visibility
 */
const EnergyShieldMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color('#00aaff'),
        uOpacity: 0.2,
        uFresnelPower: 2.0,
        uHexScale: 15.0,
        uPulseSpeed: 1.5,
    },
    // Vertex Shader
    `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    // Fragment Shader
    `
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uFresnelPower;
        uniform float uHexScale;
        uniform float uPulseSpeed;
        
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        // Hexagonal pattern
        float hexDistance(vec2 p) {
            p = abs(p);
            return max(p.x * 0.866025 + p.y * 0.5, p.y);
        }
        
        vec4 hexCoords(vec2 uv) {
            vec2 r = vec2(1.0, 1.732);
            vec2 h = r * 0.5;
            vec2 a = mod(uv, r) - h;
            vec2 b = mod(uv - h, r) - h;
            
            vec2 gv = length(a) < length(b) ? a : b;
            float x = atan(gv.x, gv.y);
            float y = 0.5 - hexDistance(gv);
            
            return vec4(gv.x, gv.y, x, y);
        }
        
        void main() {
            // Fresnel effect (edge glow)
            vec3 viewDir = normalize(vViewPosition);
            float fresnel = 1.0 - abs(dot(viewDir, vNormal));
            fresnel = pow(fresnel, uFresnelPower);
            
            // Hexagonal grid
            vec2 hexUv = vUv * uHexScale;
            vec4 hex = hexCoords(hexUv);
            
            // Hex edge glow
            float hexEdge = smoothstep(0.0, 0.1, hex.w) * smoothstep(0.5, 0.1, hex.w);
            
            // Animated pulse waves (traveling up the shield)
            float pulse = sin(vWorldPosition.y * 3.0 - uTime * uPulseSpeed) * 0.5 + 0.5;
            pulse = pow(pulse, 3.0);
            
            // Combine effects
            float pattern = hexEdge * 0.7 + fresnel * 0.8 + pulse * 0.3;
            
            // Energy flicker
            float flicker = sin(uTime * 10.0) * 0.05 + 0.95;
            
            // Final color with glow
            vec3 finalColor = uColor * (1.0 + fresnel * 2.0);
            float alpha = pattern * uOpacity * flicker * (0.3 + fresnel * 0.7);
            
            // Discard very transparent pixels for better blending
            if (alpha < 0.01) discard;
            
            gl_FragColor = vec4(finalColor, alpha);
        }
    `
)

// Extend Three.js with our custom material
extend({ EnergyShieldMaterial })

/**
 * EnergyShield Component
 * Animated energy shield that appears based on proximity
 */
export const EnergyShield = ({ 
    radius = 0.8, 
    color = '#00aaff',
    visible = true,
    opacity = 0.1
}) => {
    const materialRef = useRef()
    
    // Animate the shader
    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime
        }
    })
    
    const colorObj = useMemo(() => new THREE.Color(color), [color])
    
    if (!visible) return null
    
    return (
        <mesh>
            <sphereGeometry args={[radius, 16, 16]} />
            <energyShieldMaterial
                ref={materialRef}
                uColor={colorObj}
                uOpacity={opacity}
                transparent
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    )
}
