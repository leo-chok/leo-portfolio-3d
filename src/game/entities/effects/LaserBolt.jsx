import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * LaserBolt - Star Wars style laser projectile
 * 
 * Creates an elongated glowing bolt that travels in a direction.
 * Auto-despawns after lifetime expires.
 * 
 * @param {Array} startPosition - [x, y, z] Initial world position
 * @param {THREE.Vector3} direction - Normalized direction vector
 * @param {string} owner - 'player' (green) or 'enemy' (red)
 * @param {number} speed - Units per second (default 50)
 * @param {number} lifetime - Seconds before despawn (default 4)
 * @param {Function} onComplete - Callback when laser expires
 */
export const LaserBolt = forwardRef(({
    startPosition = [0, 0, 0],
    direction,
    owner = 'player',
    speed = 80,
    lifetime = 3,
    onComplete
}, ref) => {
    const groupRef = useRef()
    const timeRef = useRef(0)
    
    // Expose groupRef to parent for collision detection
    useImperativeHandle(ref, () => groupRef.current)
    
    // Color based on owner
    const colors = useMemo(() => {
        if (owner === 'player') {
            return {
                core: '#ffffff',
                glow: '#00ff44',  // Star Wars green
                emissive: '#00ff44'
            }
        } else {
            return {
                core: '#ffffff',
                glow: '#ff2222',  // Star Wars red
                emissive: '#ff2222'
            }
        }
    }, [owner])
    
    // Store initial direction (normalized)
    const velocity = useMemo(() => {
        const dir = direction ? direction.clone().normalize() : new THREE.Vector3(0, 0, -1)
        return dir.multiplyScalar(speed)
    }, [direction, speed])
    
    // Calculate rotation to align cylinder with direction
    const rotation = useMemo(() => {
        const dir = direction ? direction.clone().normalize() : new THREE.Vector3(0, 0, -1)
        // Cylinder is Y-up by default, we need to rotate to point along direction
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
        const euler = new THREE.Euler().setFromQuaternion(quaternion)
        return [euler.x, euler.y, euler.z]
    }, [direction])
    
    // Animation loop
    useFrame((state, delta) => {
        if (!groupRef.current) return
        
        timeRef.current += delta
        
        // Check if expired
        if (timeRef.current >= lifetime) {
            onComplete?.()
            return
        }
        
        // Move along velocity
        groupRef.current.position.x += velocity.x * delta
        groupRef.current.position.y += velocity.y * delta
        groupRef.current.position.z += velocity.z * delta
    })
    
    // Laser dimensions - elongated bolt
    const length = 0.6  // Length of the bolt
    const radius = 0.002 // Thin bolt
    
    return (
        <group ref={groupRef} position={startPosition}>
            {/* Outer glow - larger, more transparent */}
            <mesh rotation={rotation}>
                <cylinderGeometry args={[radius * 3, radius * 3, length, 8]} />
                <meshBasicMaterial
                    color={colors.glow}
                    transparent
                    opacity={0.4}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
            
            {/* Middle glow */}
            <mesh rotation={rotation}>
                <cylinderGeometry args={[radius * 1.5, radius * 1.5, length, 8]} />
                <meshBasicMaterial
                    color={colors.glow}
                    transparent
                    opacity={0.7}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
            
            {/* Inner core - bright white */}
            <mesh rotation={rotation}>
                <cylinderGeometry args={[radius, radius, length, 8]} />
                <meshBasicMaterial
                    color={colors.core}
                    transparent
                    opacity={1}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>
        </group>
    )
})
