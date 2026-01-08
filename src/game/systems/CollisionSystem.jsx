import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../../stores/gameStore'
import { useSpaceshipStore } from '../../stores/spaceshipStore'
import { useCameraStore } from '../../stores/cameraStore'
import * as THREE from 'three'

/**
 * CollisionSystem - Centralized collision detection
 * 
 * Handles ALL collisions:
 * - Ship → Body = death + explosion
 * - Laser (any) → Body = remove laser + explosion
 * - Player Laser → Enemy = damage enemy
 * - Enemy Laser → Player = damage player
 * - Enemy → Body = destroy enemy
 */
export const CollisionSystem = ({ shipRef }) => {
    // Reusable THREE objects
    const temp = useRef({
        bodyPos: new THREE.Vector3(),
        laserPos: new THREE.Vector3(),
        enemyPos: new THREE.Vector3()
    }).current
    
    useFrame(() => {
        const bodyRegistry = useCameraStore.getState().bodyRegistry
        const { 
            lasers, laserRefs, removeLaser, addExplosion,
            enemyRefs, damageEnemy, removeEnemy
        } = useGameStore.getState()
        const { isDead } = useSpaceshipStore.getState()
        const die = useSpaceshipStore.getState().die
        
        const shipPos = shipRef?.current?.position
        
        const lasersToRemove = []
        const enemiesToDamage = []
        
        // === LASER → ENEMY COLLISIONS ===
        // Player lasers hitting enemies
        for (const laser of lasers) {
            if (laser.owner !== 'player') continue
            
            const laserRef = laserRefs[laser.id]
            if (!laserRef?.current) continue
            
            laserRef.current.getWorldPosition(temp.laserPos)
            
            for (const [enemyId, enemyRef] of Object.entries(enemyRefs)) {
                if (!enemyRef?.current) continue
                
                temp.enemyPos.copy(enemyRef.current.position)
                
                const dx = temp.laserPos.x - temp.enemyPos.x
                const dy = temp.laserPos.y - temp.enemyPos.y
                const dz = temp.laserPos.z - temp.enemyPos.z
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
                
                const hitRadius = 1.5 // Enemy hit radius
                
                if (distance < hitRadius) {
                    lasersToRemove.push(laser.id)
                    enemiesToDamage.push(Number(enemyId))
                    break
                }
            }
        }
        
        // === ENEMY LASER → PLAYER COLLISIONS ===
        if (shipPos && !isDead) {
            const takeDamage = useSpaceshipStore.getState().takeDamage
            
            for (const laser of lasers) {
                if (laser.owner !== 'enemy') continue
                
                const laserRef = laserRefs[laser.id]
                if (!laserRef?.current) continue
                
                laserRef.current.getWorldPosition(temp.laserPos)
                
                const dx = temp.laserPos.x - shipPos.x
                const dy = temp.laserPos.y - shipPos.y
                const dz = temp.laserPos.z - shipPos.z
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
                
                const hitRadius = 1.0 // Player hit radius
                
                if (distance < hitRadius) {
                    lasersToRemove.push(laser.id)
                    // Damage player 10% instead of instant death
                    const died = takeDamage(10)
                    if (died) {
                        addExplosion([shipPos.x, shipPos.y, shipPos.z], 2.0)
                    }
                    break
                }
            }
        }
        
        // === BODY COLLISIONS ===
        for (const [bodyId, body] of Object.entries(bodyRegistry)) {
            if (!body.ref?.current) continue
            
            temp.bodyPos.setFromMatrixPosition(body.ref.current.matrixWorld)
            
            let collisionRadius
            if (bodyId === 'presentation') {
                collisionRadius = (body.size || 1) * 0.7
            } else {
                collisionRadius = (body.size || 1) * 1.0
            }
            
            // Ship → Body
            if (shipPos && !isDead) {
                const dx = shipPos.x - temp.bodyPos.x
                const dy = shipPos.y - temp.bodyPos.y
                const dz = shipPos.z - temp.bodyPos.z
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
                
                if (distance < collisionRadius) {
                    const deathPos = [shipPos.x, shipPos.y, shipPos.z]
                    die(deathPos)
                    addExplosion(deathPos, 1.0)
                    break
                }
            }
            
            // Laser → Body
            for (const [laserId, laserRef] of Object.entries(laserRefs)) {
                if (!laserRef?.current) continue
                if (lasersToRemove.includes(Number(laserId))) continue
                
                laserRef.current.getWorldPosition(temp.laserPos)
                
                const dx = temp.laserPos.x - temp.bodyPos.x
                const dy = temp.laserPos.y - temp.bodyPos.y
                const dz = temp.laserPos.z - temp.bodyPos.z
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
                
                if (distance < collisionRadius) {
                    lasersToRemove.push(Number(laserId))
                    addExplosion(
                        [temp.laserPos.x, temp.laserPos.y, temp.laserPos.z],
                        0.2
                    )
                }
            }
            
            // Enemy → Body
            for (const [enemyId, enemyRef] of Object.entries(enemyRefs)) {
                if (!enemyRef?.current) continue
                
                temp.enemyPos.copy(enemyRef.current.position)
                
                const dx = temp.enemyPos.x - temp.bodyPos.x
                const dy = temp.enemyPos.y - temp.bodyPos.y
                const dz = temp.enemyPos.z - temp.bodyPos.z
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
                
                if (distance < collisionRadius) {
                    // Enemy crashed into planet
                    addExplosion(
                        [temp.enemyPos.x, temp.enemyPos.y, temp.enemyPos.z],
                        0.8
                    )
                    removeEnemy(Number(enemyId))
                }
            }
        }
        
        // Process removals
        lasersToRemove.forEach(id => removeLaser(id))
        enemiesToDamage.forEach(id => damageEnemy(id, 1))
    })
    
    return null
}
