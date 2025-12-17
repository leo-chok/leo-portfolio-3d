import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * Crosshair - Clean minimal targeting reticle
 * 
 * Design: Two curved brackets, horizontal dashes, center circle
 * No animations
 */
export const Crosshair = () => {
    // Position in front of ship
    const zPosition = -1
    const size = 0.025
    
    // Left bracket arc (curved parenthesis)
    const leftBracketGeometry = useMemo(() => {
        const points = []
        const radius = size
        const startAngle = THREE.MathUtils.degToRad(150)
        const endAngle = THREE.MathUtils.degToRad(210)
        const segments = 15
        
        for (let i = 0; i <= segments; i++) {
            const angle = startAngle + (i / segments) * (endAngle - startAngle)
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius - size * 0.3,
                Math.sin(angle) * radius,
                0
            ))
        }
        return new THREE.BufferGeometry().setFromPoints(points)
    }, [size])
    
    // Right bracket arc (curved parenthesis)
    const rightBracketGeometry = useMemo(() => {
        const points = []
        const radius = size
        const startAngle = THREE.MathUtils.degToRad(-30)
        const endAngle = THREE.MathUtils.degToRad(30)
        const segments = 15
        
        for (let i = 0; i <= segments; i++) {
            const angle = startAngle + (i / segments) * (endAngle - startAngle)
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius + size * 0.3,
                Math.sin(angle) * radius,
                0
            ))
        }
        return new THREE.BufferGeometry().setFromPoints(points)
    }, [size])
    
    // Center circle
    const centerCircleGeometry = useMemo(() => {
        const points = []
        const radius = size * 0.15
        const segments = 20
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            ))
        }
        return new THREE.BufferGeometry().setFromPoints(points)
    }, [size])
    
    const dashLength = size * 0.3
    const dashOffset = size * 0.5
    
    return (
        <group position={[0, 0, zPosition]}>
            {/* Left bracket */}
            <line geometry={leftBracketGeometry}>
                <lineBasicMaterial color="#7cc4ed" transparent opacity={0.7} />
            </line>
            
            {/* Right bracket */}
            <line geometry={rightBracketGeometry}>
                <lineBasicMaterial color="#7cc4ed" transparent opacity={0.7} />
            </line>
            
            {/* Center circle */}
            <line geometry={centerCircleGeometry}>
                <lineBasicMaterial color="#7cc4ed" transparent opacity={0.6} />
            </line>
            
            {/* Left dash */}
            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={2}
                        array={new Float32Array([-dashOffset - dashLength, 0, 0, -dashOffset, 0, 0])}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#7cc4ed" transparent opacity={0.6} />
            </line>
            
            {/* Right dash */}
            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={2}
                        array={new Float32Array([dashOffset, 0, 0, dashOffset + dashLength, 0, 0])}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#7cc4ed" transparent opacity={0.6} />
            </line>
        </group>
    )
}
