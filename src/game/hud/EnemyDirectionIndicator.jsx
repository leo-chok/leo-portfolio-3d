import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../stores/gameStore'

/**
 * EnemyDirectionIndicator - 3D arrows on a sphere pointing to enemies
 * 
 * - Positioned on a sphere around the ship for true 3D spatial awareness
 * - 3D cone arrows point exactly toward each enemy
 * - Disappears when enemy is in field of view
 * - Size based on distance (close = big, far = small)
 */
export const EnemyDirectionIndicator = ({ shipRef }) => {
    const groupRef = useRef()
    
    // Config
    const SPHERE_RADIUS = 0.35    // Radius of indicator sphere around ship
    const HUD_Z_OFFSET = -0.3     // Z offset in front of ship
    const MIN_SIZE = 0.4          // Far away
    const MAX_SIZE = 1.2          // Close
    const MIN_DISTANCE = 15
    const MAX_DISTANCE = 100
    const FOV_THRESHOLD = Math.cos(THREE.MathUtils.degToRad(20)) // Hide when in view
    
    // Reusable vectors
    const tempVec = useMemo(() => new THREE.Vector3(), [])
    const tempQuat = useMemo(() => new THREE.Quaternion(), [])
    const upVector = useMemo(() => new THREE.Vector3(0, 1, 0), [])
    
    // Get enemies from store
    const enemies = useGameStore(state => state.enemies)
    
    useFrame(() => {
        if (!groupRef.current || !shipRef?.current) return
        
        const enemyRefs = useGameStore.getState().enemyRefs
        const shipPos = shipRef.current.position
        const shipQuatInverse = shipRef.current.quaternion.clone().invert()
        
        // Update each arrow
        groupRef.current.children.forEach((arrow, index) => {
            const enemy = enemies[index]
            if (!enemy) {
                arrow.visible = false
                return
            }
            
            const enemyRef = enemyRefs[enemy.id]
            if (!enemyRef?.current) {
                arrow.visible = false
                return
            }
            
            const enemyPos = enemyRef.current.position
            
            // Direction to enemy in world space
            tempVec.subVectors(enemyPos, shipPos)
            const distance = tempVec.length()
            tempVec.normalize()
            
            // Convert to local ship space
            const localDir = tempVec.clone().applyQuaternion(shipQuatInverse)
            
            // Check if enemy is in front (within FOV) - hide indicator
            // localDir.z < 0 means in front, we check if it's mostly forward
            const forwardDot = -localDir.z // How much is it in front
            if (forwardDot > FOV_THRESHOLD) {
                arrow.visible = false
                return
            }
            
            // Position arrow on sphere surface in local space
            // The arrow sits on the sphere, pointing toward the enemy
            const spherePos = localDir.clone().multiplyScalar(SPHERE_RADIUS)
            spherePos.z += HUD_Z_OFFSET // Shift forward to be visible
            
            arrow.position.copy(spherePos)
            
            // Rotate arrow to point toward enemy direction
            // Create a quaternion that rotates from default (pointing +Y) to localDir
            tempQuat.setFromUnitVectors(upVector, localDir)
            arrow.quaternion.copy(tempQuat)
            
            // Size based on distance - INVERTED (close = big, far = small)
            const distanceFactor = THREE.MathUtils.clamp(
                (distance - MIN_DISTANCE) / (MAX_DISTANCE - MIN_DISTANCE),
                0, 1
            )
            const size = MAX_SIZE - distanceFactor * (MAX_SIZE - MIN_SIZE)
            arrow.scale.setScalar(size)
            
            arrow.visible = true
        })
    })
    
    // 3D Cone geometry for arrow (pointing +Y by default)
    const coneGeometry = useMemo(() => {
        return new THREE.ConeGeometry(0.015, 0.04, 8)
    }, [])
    
    // Materials
    const mainMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        color: '#ff4444',
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }), [])
    
    const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        color: '#ff6600',
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }), [])
    
    return (
        <group ref={groupRef}>
            {/* Render one 3D arrow per enemy */}
            {enemies.map((enemy) => (
                <group key={enemy.id} visible={false}>
                    {/* Main cone */}
                    <mesh geometry={coneGeometry} material={mainMaterial} />
                    {/* Glow cone */}
                    <mesh geometry={coneGeometry} material={glowMaterial} scale={1.4} />
                </group>
            ))}
        </group>
    )
}
