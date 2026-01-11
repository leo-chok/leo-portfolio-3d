import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../stores/gameStore'

/**
 * EnemyDirectionIndicator - Arrows pointing to ALL enemies
 * 
 * - One arrow per enemy
 * - Disappears when enemy is in field of view
 * - Size: LARGE when close, SMALL when far (inverted)
 */
export const EnemyDirectionIndicator = ({ shipRef }) => {
    const groupRef = useRef()
    const arrowsDataRef = useRef({}) // Track data per enemy
    
    // Config - Match HUD circle dimensions
    const HUD_RADIUS = 0.22 // Slightly outside the HUD arcs (0.18)
    const HUD_Z = -0.5 // Same Z plane as HUD
    const HUD_CENTER_Y = 0.05 // Vertical center of HUD
    const MIN_SIZE = 0.5   // Far away
    const MAX_SIZE = 1.5   // Close
    const MIN_DISTANCE = 20
    const MAX_DISTANCE = 100
    const FOV_THRESHOLD = Math.cos(THREE.MathUtils.degToRad(35))
    
    // Get enemies from store
    const enemies = useGameStore(state => state.enemies)
    
    useFrame((state, delta) => {
        if (!groupRef.current || !shipRef?.current) return
        
        const enemyRefs = useGameStore.getState().enemyRefs
        const shipPos = shipRef.current.position
        
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
            const toEnemy = new THREE.Vector3().subVectors(enemyPos, shipPos)
            const distance = toEnemy.length()
            
            // Convert to local ship space
            const localDir = toEnemy.clone()
            localDir.applyQuaternion(shipRef.current.quaternion.clone().invert())
            localDir.normalize()
            
            // Check if enemy is in front (within FOV)
            const isInFront = localDir.z < 0 && Math.abs(localDir.z) > FOV_THRESHOLD
            
            if (isInFront) {
                arrow.visible = false
                return
            }
            
            // Calculate angle for circular placement
            // Use X and Y for 2D circle, angle 0 = top
            const angle = Math.atan2(localDir.x, -localDir.y)
            
            // Size based on distance - INVERTED (close = big, far = small)
            const distanceFactor = THREE.MathUtils.clamp(
                (distance - MIN_DISTANCE) / (MAX_DISTANCE - MIN_DISTANCE),
                0, 1
            )
            const size = MAX_SIZE - distanceFactor * (MAX_SIZE - MIN_SIZE)
            
            // Position arrow on circle around HUD
            arrow.position.set(
                Math.sin(angle) * HUD_RADIUS,
                HUD_CENTER_Y + Math.cos(angle) * HUD_RADIUS,
                HUD_Z
            )
            
            // Rotate arrow to point outward (towards enemy direction)
            arrow.rotation.z = -angle
            arrow.scale.set(size, size, 1)
            arrow.visible = true
        })
    })
    
    // Arrow geometry
    const arrowGeometry = useMemo(() => {
        const shape = new THREE.Shape()
        const s = 0.012
        
        shape.moveTo(0, s * 1.2)
        shape.lineTo(-s, 0)
        shape.lineTo(-s * 0.4, 0)
        shape.lineTo(0, s * 0.5)
        shape.lineTo(s * 0.4, 0)
        shape.lineTo(s, 0)
        shape.closePath()
        
        return new THREE.ShapeGeometry(shape)
    }, [])
    
    // Create materials once
    const mainMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        color: '#ff4444',
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }), [])
    
    const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        color: '#ff6600',
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }), [])
    
    return (
        <group ref={groupRef}>
            {/* Render one arrow group per enemy */}
            {enemies.map((enemy, index) => (
                <group key={enemy.id} visible={false}>
                    {/* Main arrow */}
                    <mesh geometry={arrowGeometry} material={mainMaterial} />
                    {/* Glow */}
                    <mesh geometry={arrowGeometry} material={glowMaterial} scale={1.3} />
                </group>
            ))}
        </group>
    )
}
