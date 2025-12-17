import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Billboard, Text } from '@react-three/drei'
import { COLORS } from '../../../config/galaxyConfig'
import { useDebugStore } from '../../../stores/debugStore'

// Icon to emoji/symbol mapping
const ICON_MAP = {
    // Hardskills (tech)
    'react': '⚛',
    'node-js': '🟢',
    'js': 'JS',
    'html5': '🌐',
    'css3-alt': '🎨',
    'docker': '🐳',
    'github': '🐙',
    // Softskills
    'users': '👥',
    'comments': '💬',
    'lightbulb': '💡',
    'handshake': '🤝',
    'brain': '🧠',
}

/**
 * Satellite Component - Optimized with icon support
 * Shows icon symbol instead of sphere
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
    const orbitAngle = useRef(initialAngle)
    const [hovered, setHovered] = useState(false)
    
    const color = COLORS.hud
    const satelliteEmissive = useDebugStore(state => state.satelliteEmissive) ?? 1.5
    
    // Pre-computed values (memoized)
    const tiltXRad = useMemo(() => (orbitTilt.x * Math.PI) / 180, [orbitTilt.x])
    const tiltYRad = useMemo(() => (orbitTilt.y * Math.PI) / 180, [orbitTilt.y])
    
    // Get icon symbol
    const iconSymbol = icon ? (ICON_MAP[icon] || '●') : '●'
    
    // Minimal useFrame - just orbit rotation
    useFrame((state, delta) => {
        if (orbitRef.current) {
            orbitAngle.current += orbitSpeed * delta
            orbitRef.current.rotation.y = orbitAngle.current
        }
    })
    
    const size = 0.15
    
    return (
        <group rotation={[tiltXRad, tiltYRad, 0]}>
            <group ref={orbitRef}>
                <group position={[orbitRadius, 0, 0]}>
                    <Billboard
                        follow={true}
                        onClick={(e) => { e.stopPropagation(); onClick?.() }}
                        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true) }}
                        onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false) }}
                    >
                        <Text 
                            fontSize={size} 
                            color={hovered ? '#ffffff' : color}
                            anchorX="center" 
                            anchorY="middle"
                        >
                            {iconSymbol}
                        </Text>
                    </Billboard>
                    
                    {hovered && name && (
                        <Billboard position={[0, 0.25, 0]}>
                            <Text fontSize={0.1} color={COLORS.hud} anchorX="center" anchorY="bottom">
                                {name}
                            </Text>
                        </Billboard>
                    )}
                </group>
            </group>
        </group>
    )
}
