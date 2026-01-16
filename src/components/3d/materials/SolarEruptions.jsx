import { useRef, useState, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'

/**
 * SolarEruptionMaterial - Custom shader for animated eruption
 * Uses Perlin noise for organic deformation and color animation
 */
const SolarEruptionMaterial = shaderMaterial(
    {
        uTime: 0,
        uProgress: 0,       // 0 to 1 for lifecycle
        uOpacity: 1,
        uColor1: new THREE.Color('#ff8800'),
        uColor2: new THREE.Color('#ff2200'),
        uColor3: new THREE.Color('#ffcc00'),
    },
    // Vertex shader - noise displacement
    /* glsl */ `
        uniform float uTime;
        uniform float uProgress;
        
        varying vec2 vUv;
        varying float vDisplacement;
        
        // Simplex 3D noise
        vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            
            vec3 i = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            
            i = mod(i, 289.0);
            vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            
            float n_ = 1.0/7.0;
            vec3 ns = n_ * D.wyz - D.xzx;
            
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
            
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
            
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
            vUv = uv;
            
            // Multi-octave noise for organic movement
            float noiseScale = 2.0;
            float timeScale = 0.5;
            
            float noise1 = snoise(vec3(position.xy * noiseScale, uTime * timeScale));
            float noise2 = snoise(vec3(position.xy * noiseScale * 2.0, uTime * timeScale * 1.5)) * 0.5;
            float noise3 = snoise(vec3(position.xy * noiseScale * 4.0, uTime * timeScale * 2.0)) * 0.25;
            
            float totalNoise = noise1 + noise2 + noise3;
            
            // Displacement increases with height (uv.y) and progress
            float heightFactor = pow(uv.y, 0.5);
            float displacement = totalNoise * 0.3 * heightFactor * uProgress;
            
            vDisplacement = displacement;
            
            // === TAPER: wide at base (sun), narrow at top ===
            // uv.y = 0 at bottom, 1 at top
            // Scale X inversely with height
            float taperFactor = 1.0 - uv.y * 0.7; // 1.0 at bottom, 0.3 at top
            
            // Apply displacement outward (in normal direction)
            vec3 newPosition = position;
            newPosition.x *= taperFactor; // Apply taper
            newPosition.x += displacement * 0.5 * taperFactor;
            newPosition.z += displacement * 0.3 * taperFactor;
            
            // Scale based on progress (grows upward)
            newPosition.y *= uProgress;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `,
    // Fragment shader - animated colors with noisy edges
    /* glsl */ `
        uniform float uTime;
        uniform float uProgress;
        uniform float uOpacity;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        
        varying vec2 vUv;
        varying float vDisplacement;
        
        // Simple 2D noise for edge breakup
        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        
        float noise2D(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            
            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        
        void main() {
            // Base color gradient (bottom to top)
            float gradient = vUv.y;
            
            // Mix colors based on height and displacement
            vec3 color = mix(uColor1, uColor2, gradient);
            color = mix(color, uColor3, vDisplacement * 2.0 + 0.3);
            
            // Add bright core
            float core = 1.0 - abs(vUv.x - 0.5) * 2.0;
            core = pow(core, 2.0);
            color += vec3(1.0, 0.8, 0.4) * core * 0.5;
            
            // === NOISY EDGE BREAKUP ===
            // Multi-scale noise for organic edges
            float edgeNoise = noise2D(vUv * 8.0 + uTime * 0.5) * 0.5;
            edgeNoise += noise2D(vUv * 16.0 + uTime * 0.8) * 0.3;
            edgeNoise += noise2D(vUv * 32.0 + uTime * 1.2) * 0.2;
            
            // Edge distance with noise displacement
            float edgeDist = abs(vUv.x - 0.5) * 2.0;
            float noisyEdge = edgeDist - edgeNoise * 0.4;
            float edgeFade = 1.0 - smoothstep(0.3, 0.9, noisyEdge);
            
            // Top fade with noise for wispy tips
            float topNoise = noise2D(vec2(vUv.x * 10.0, uTime * 0.3)) * 0.3;
            float topFade = 1.0 - smoothstep(0.5 - topNoise, 0.95, vUv.y);
            
            float alpha = edgeFade * topFade * uOpacity;
            
            // Discard very transparent pixels for performance
            if (alpha < 0.01) discard;
            
            // Add flicker
            float flicker = 0.9 + 0.1 * sin(uTime * 10.0 + vUv.y * 5.0);
            
            gl_FragColor = vec4(color * flicker, alpha);
        }
    `
)

// Extend for JSX usage
extend({ SolarEruptionMaterial })

/**
 * Single eruption with shader animation
 */
const ShaderEruption = ({ position, rotation, sunRadius, onComplete }) => {
    const meshRef = useRef()
    const materialRef = useRef()
    
    const progressRef = useRef(0)
    const phaseRef = useRef('rising')
    const [visible, setVisible] = useState(true)
    
    // Config
    const RISE_DURATION = 4
    const HOLD_DURATION = 1
    const FADE_DURATION = 2
    const HEIGHT = sunRadius * 0.6
    const WIDTH = sunRadius * 0.25
    
    useFrame((state, delta) => {
        if (!materialRef.current || !visible) return
        
        progressRef.current += delta
        const progress = progressRef.current
        
        materialRef.current.uTime = state.clock.elapsedTime
        
        if (phaseRef.current === 'rising') {
            const riseProgress = Math.min(progress / RISE_DURATION, 1)
            const eased = 1 - Math.pow(1 - riseProgress, 3)
            
            materialRef.current.uProgress = eased
            materialRef.current.uOpacity = eased * 0.85
            
            if (progress > RISE_DURATION + HOLD_DURATION) {
                phaseRef.current = 'fading'
                progressRef.current = 0
            }
        } else if (phaseRef.current === 'fading') {
            const fadeProgress = Math.min(progress / FADE_DURATION, 1)
            
            materialRef.current.uOpacity = (1 - fadeProgress) * 0.85
            materialRef.current.uProgress = 1 - fadeProgress * 0.3
            
            if (fadeProgress >= 1) {
                setVisible(false)
                onComplete?.()
            }
        }
    })
    
    if (!visible) return null
    
    return (
        <group position={position} rotation={rotation}>
            {/* Eruption plane extending outward */}
            <mesh ref={meshRef} position={[0, HEIGHT / 2, 0]}>
                <planeGeometry args={[WIDTH, HEIGHT, 32, 64]} />
                <solarEruptionMaterial
                    ref={materialRef}
                    transparent
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
            {/* Cross plane for volume */}
            <mesh position={[0, HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[WIDTH, HEIGHT, 32, 64]} />
                <solarEruptionMaterial
                    transparent
                    side={THREE.DoubleSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
        </group>
    )
}

/**
 * SolarEruptions - Manager for shader-based eruptions
 */
export const SolarEruptions = ({ sunRadius = 15 }) => {
    const [eruptions, setEruptions] = useState([])
    const nextIdRef = useRef(0)
    const lastSpawnRef = useRef(0)
    const nextSpawnDelayRef = useRef(2)
    
    const SPAWN_INTERVAL_MIN = 4
    const SPAWN_INTERVAL_MAX = 10
    const MAX_ACTIVE = 3
    
    useFrame((state, delta) => {
        lastSpawnRef.current += delta
        
        if (lastSpawnRef.current >= nextSpawnDelayRef.current && eruptions.length < MAX_ACTIVE) {
            // Random position on sun surface
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI * 0.6 + Math.PI * 0.2
            
            const x = Math.sin(phi) * Math.cos(theta) * sunRadius
            const y = Math.cos(phi) * sunRadius
            const z = Math.sin(phi) * Math.sin(theta) * sunRadius
            
            // Calculate rotation to point outward
            const position = new THREE.Vector3(x, y, z)
            const up = position.clone().normalize()
            const quaternion = new THREE.Quaternion()
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up)
            const euler = new THREE.Euler().setFromQuaternion(quaternion)
            
            setEruptions(prev => [...prev, {
                id: nextIdRef.current++,
                position: [x, y, z],
                rotation: [euler.x, euler.y, euler.z],
            }])
            
            lastSpawnRef.current = 0
            nextSpawnDelayRef.current = SPAWN_INTERVAL_MIN + Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN)
        }
    })
    
    const handleComplete = (id) => {
        setEruptions(prev => prev.filter(e => e.id !== id))
    }
    
    return (
        <group>
            {eruptions.map(eruption => (
                <ShaderEruption
                    key={eruption.id}
                    position={eruption.position}
                    rotation={eruption.rotation}
                    sunRadius={sunRadius}
                    onComplete={() => handleComplete(eruption.id)}
                />
            ))}
        </group>
    )
}
