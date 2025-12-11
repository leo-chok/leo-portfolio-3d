import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Billboard, Text } from '@react-three/drei'
import { COLORS } from '../../config/galaxyConfig'
import { useDebugStore } from '../../stores/debugStore'

/**
 * Satellite Component - Highly optimized
 * - Simple 3D sphere (no Html)
 * - Color updates on hover change only (not every frame)
 * - Minimal useFrame work
 */
export const Satellite = ({ 
    name, 
    icon,
    orbitRadius = 1.5, 
    orbitSpeed = 0.5,
    orbitTilt = { x: 0, y: 0 },
    initialAngle = 0,
    onClick 
}) => {
    const orbitRef = useRef()
    const meshRef = useRef()
    const orbitAngle = useRef(initialAngle)
    const [hovered, setHovered] = useState(false)
    
    const color = COLORS.hud
    const satelliteEmissive = useDebugStore(state => state.satelliteEmissive)
    
    // Pre-computed values (memoized)
    const tiltXRad = useMemo(() => (orbitTilt.x * Math.PI) / 180, [orbitTilt.x])
    const tiltYRad = useMemo(() => (orbitTilt.y * Math.PI) / 180, [orbitTilt.y])
    const baseColor = useMemo(() => new THREE.Color(color), [color])
    const initialColor = useMemo(() => baseColor.clone().multiplyScalar(satelliteEmissive), [baseColor, satelliteEmissive])
    
    // Update color ONLY on hover or emissive change
    useEffect(() => {
        if (meshRef.current?.material) {
            const multiplier = hovered ? satelliteEmissive * 2 : satelliteEmissive
            meshRef.current.material.color.copy(baseColor).multiplyScalar(multiplier)
        }
    }, [hovered, satelliteEmissive, baseColor])
    
    // Minimal useFrame - just orbit rotation
    useFrame((state, delta) => {
        if (orbitRef.current) {
            orbitAngle.current += orbitSpeed * delta
            orbitRef.current.rotation.y = orbitAngle.current
        }
    })
    
    const size = 0.08
    
    return (
        <group rotation={[tiltXRad, tiltYRad, 0]}>
            <group ref={orbitRef}>
                <group position={[orbitRadius, 0, 0]}>
                    <mesh
                        ref={meshRef}
                        onClick={(e) => { e.stopPropagation(); onClick?.() }}
                        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true) }}
                        onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false) }}
                    >
                        <sphereGeometry args={[size, 8, 8]} />
                        <meshBasicMaterial 
                            color={initialColor}
                            toneMapped={false}
                        />
                    </mesh>
                    
                    {hovered && name && (
                        <Billboard position={[0, 0.3, 0]}>
                            <Text fontSize={0.12} color={COLORS.hud} anchorX="center" anchorY="bottom">
                                {name}
                            </Text>
                        </Billboard>
                    )}
                </group>
            </group>
        </group>
    )
}
