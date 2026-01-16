import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '../../../stores/gameStore'
import { useSpaceshipStore } from '../../../stores/spaceshipStore'
import { useAudioStore } from '../../../stores/audioStore'
import { EnemyEngineGlow } from './EnemyEngineGlow'
import { ENEMY_CONFIG } from '../../config'

/**
 * EnemyShip - AI with attack run pattern and smooth transitions
 * 
 * Phases:
 * 1. APPROACH: Fly towards locked player position, fire when aligned
 * 2. PASS_THROUGH: Continue straight after passing player
 * 3. LOOP: Large turning loop
 * 4. REALIGN: Smooth transition back to approach
 * 
 * All direction changes are lerped for smooth movement.
 */
export const EnemyShip = ({ id, initialPosition = [0, 0, 0], health = 1 }) => {
    const groupRef = useRef()
    const stateRef = useRef('APPROACH')
    const speedRef = useRef(0)
    const lastShotTimeRef = useRef(0)
    
    // Current movement direction (always lerped, never snapped)
    const currentDirectionRef = useRef(new THREE.Vector3(0, 0, 1))
    const targetDirectionRef = useRef(new THREE.Vector3(0, 0, 1))
    
    // Attack run state
    const lockedTargetRef = useRef(new THREE.Vector3())
    const passThroughTimerRef = useRef(0)
    const passThroughDurationRef = useRef(0)
    
    // Loop state
    const loopProgressRef = useRef(0)
    const loopCenterRef = useRef(new THREE.Vector3())
    const loopStartAngleRef = useRef(0)
    const loopRadiusRef = useRef(50)
    const loopSideRef = useRef(1)
    
    // Roll (banking) state
    const currentRollRef = useRef(0) // Current roll angle
    const targetRollRef = useRef(0) // Target roll angle
    const prevDirectionRef = useRef(new THREE.Vector3()) // For calculating turn rate
    
    // Reusable vectors
    const tempVec = useRef(new THREE.Vector3())
    
    // Destructure config for cleaner code
    const {
        approachSpeed: APPROACH_SPEED,
        loopSpeed: LOOP_SPEED,
        passThroughSpeed: PASS_THROUGH_SPEED,
        realignSpeed: REALIGN_SPEED,
        shotCooldownAligned: SHOT_COOLDOWN_ALIGNED,
        shotCooldownNormal: SHOT_COOLDOWN_NORMAL,
        alignmentThreshold: ALIGNMENT_THRESHOLD,
        passThroughMin: PASS_THROUGH_MIN,
        passThroughMax: PASS_THROUGH_MAX,
        loopRadius: LOOP_RADIUS,
        directionLerpSpeed: DIRECTION_LERP_SPEED,
        maxRoll: MAX_ROLL,
        rollLerpSpeed: ROLL_LERP_SPEED,
        modelScale,
        engineGlowPosition,
        engineGlowSize
    } = ENEMY_CONFIG
    
    // Load enemy model
    const { scene } = useGLTF('/ennemy_spaceship-opt.glb')
    
    const enemyModel = useMemo(() => {
        const clone = scene.clone()
        clone.traverse((child) => {
            if (child.isMesh) child.castShadow = true
        })
        return clone
    }, [scene])
    
    // Register ref on mount
    useEffect(() => {
        if (groupRef.current) {
            useGameStore.getState().registerEnemyRef(id, groupRef)
            groupRef.current.position.set(...initialPosition)
            
            // Initialize direction towards player
            const storePos = useSpaceshipStore.getState().position
            if (storePos) {
                const px = typeof storePos.x === 'number' ? storePos.x : storePos[0]
                const py = typeof storePos.y === 'number' ? storePos.y : storePos[1]
                const pz = typeof storePos.z === 'number' ? storePos.z : storePos[2]
                lockedTargetRef.current.set(px, py, pz)
                currentDirectionRef.current.subVectors(lockedTargetRef.current, groupRef.current.position).normalize()
                targetDirectionRef.current.copy(currentDirectionRef.current)
            }
        }
    }, [id, initialPosition])
    
    useFrame((state, delta) => {
        if (!groupRef.current) return
        
        const pos = groupRef.current.position
        const currentState = stateRef.current
        let currentSpeed = 0
        
        // Get current player position
        const storePos = useSpaceshipStore.getState().position
        const playerPos = new THREE.Vector3()
        if (storePos) {
            playerPos.set(
                typeof storePos.x === 'number' ? storePos.x : storePos[0],
                typeof storePos.y === 'number' ? storePos.y : storePos[1],
                typeof storePos.z === 'number' ? storePos.z : storePos[2]
            )
        }
        
        // === STATE: APPROACH ===
        if (currentState === 'APPROACH') {
            currentSpeed = APPROACH_SPEED
            
            // Target direction is towards locked position
            targetDirectionRef.current.subVectors(lockedTargetRef.current, pos).normalize()
            
            // Check if we've passed the locked target
            const toTarget = tempVec.current.subVectors(lockedTargetRef.current, pos)
            const dotProduct = toTarget.dot(currentDirectionRef.current)
            
            if (dotProduct < 0) {
                // Passed target, go to PASS_THROUGH
                stateRef.current = 'PASS_THROUGH'
                passThroughTimerRef.current = 0
                passThroughDurationRef.current = PASS_THROUGH_MIN + Math.random() * (PASS_THROUGH_MAX - PASS_THROUGH_MIN)
            }
            
            // Fire when aligned with player (current position, not locked)
            const toPlayer = tempVec.current.subVectors(playerPos, pos).normalize()
            const alignment = currentDirectionRef.current.dot(toPlayer)
            
            const now = state.clock.elapsedTime
            const cooldown = alignment > ALIGNMENT_THRESHOLD ? SHOT_COOLDOWN_ALIGNED : SHOT_COOLDOWN_NORMAL
            
            if (alignment > 0.7 && now - lastShotTimeRef.current > cooldown) {
                lastShotTimeRef.current = now
                fireAtPlayer(pos, currentDirectionRef.current)
            }
        }
        
        // === STATE: PASS_THROUGH ===
        else if (currentState === 'PASS_THROUGH') {
            currentSpeed = PASS_THROUGH_SPEED
            passThroughTimerRef.current += delta
            
            // Keep going straight (target = current direction)
            targetDirectionRef.current.copy(currentDirectionRef.current)
            
            if (passThroughTimerRef.current >= passThroughDurationRef.current) {
                // Start LOOP
                stateRef.current = 'LOOP'
                loopProgressRef.current = 0
                
                // Calculate loop center perpendicular to current direction
                const perpendicular = new THREE.Vector3()
                if (Math.abs(currentDirectionRef.current.y) < 0.9) {
                    perpendicular.crossVectors(currentDirectionRef.current, new THREE.Vector3(0, 1, 0))
                } else {
                    perpendicular.crossVectors(currentDirectionRef.current, new THREE.Vector3(1, 0, 0))
                }
                perpendicular.normalize()
                
                loopSideRef.current = Math.random() > 0.5 ? 1 : -1
                loopRadiusRef.current = LOOP_RADIUS + (Math.random() - 0.5) * 20
                loopCenterRef.current.copy(pos).add(perpendicular.multiplyScalar(loopRadiusRef.current * loopSideRef.current))
                
                const toPos = new THREE.Vector3().subVectors(pos, loopCenterRef.current)
                loopStartAngleRef.current = Math.atan2(toPos.z, toPos.x)
            }
        }
        
        // === STATE: LOOP ===
        else if (currentState === 'LOOP') {
            currentSpeed = LOOP_SPEED
            
            const loopAngularSpeed = currentSpeed / loopRadiusRef.current
            loopProgressRef.current += loopAngularSpeed * delta * loopSideRef.current
            
            if (Math.abs(loopProgressRef.current) >= Math.PI) {
                // Loop complete, go to REALIGN
                stateRef.current = 'REALIGN'
            }
            
            // Calculate target position on loop
            const angle = loopStartAngleRef.current + loopProgressRef.current
            const targetX = loopCenterRef.current.x + Math.cos(angle) * loopRadiusRef.current
            const targetZ = loopCenterRef.current.z + Math.sin(angle) * loopRadiusRef.current
            
            // Target direction is towards next loop position
            const loopTargetPos = new THREE.Vector3(targetX, pos.y, targetZ)
            targetDirectionRef.current.subVectors(loopTargetPos, pos).normalize()
        }
        
        // === STATE: REALIGN ===
        else if (currentState === 'REALIGN') {
            currentSpeed = REALIGN_SPEED
            
            // Target direction is towards player
            lockedTargetRef.current.copy(playerPos)
            targetDirectionRef.current.subVectors(lockedTargetRef.current, pos).normalize()
            
            // Check if roughly aligned, then switch to APPROACH
            const alignment = currentDirectionRef.current.dot(targetDirectionRef.current)
            if (alignment > 0.95) {
                stateRef.current = 'APPROACH'
            }
        }
        
        // === SMOOTH DIRECTION LERPING (applies to all states) ===
        currentDirectionRef.current.lerp(targetDirectionRef.current, delta * DIRECTION_LERP_SPEED).normalize()
        
        // === ROLL (BANKING) CALCULATION ===
        // Calculate "turn amount" to the right relative to current direction and Up (Y)
        // Reuse tempVec to calculate a "Right" vector
        // Assuming World Up is (0,1,0)
        tempVec.current.set(0, 1, 0).cross(currentDirectionRef.current).normalize()
        
        // Check how much targetDirection is to the "Right"
        const turnRightAmount = targetDirectionRef.current.dot(tempVec.current)
        
        // Target roll: turning right -> bank right
        // Tuned multiplier for responsiveness
        const targetRoll = turnRightAmount * MAX_ROLL * 4.0
        
        // Clamp roll
        targetRollRef.current = THREE.MathUtils.clamp(targetRoll, -MAX_ROLL, MAX_ROLL)
        
        // Lerp current roll
        currentRollRef.current = THREE.MathUtils.lerp(currentRollRef.current, targetRollRef.current, delta * ROLL_LERP_SPEED)
        
        // === MOVEMENT ===
        tempVec.current.copy(currentDirectionRef.current).multiplyScalar(currentSpeed * delta)
        pos.add(tempVec.current)
        
        // === ROTATION (smooth look direction + roll) ===
        // 1. Look in movement direction
        tempVec.current.copy(pos).sub(currentDirectionRef.current)
        groupRef.current.lookAt(tempVec.current)
        
        // 2. Apply Roll (Bank)
        // Since lookAt sets orientation, we rotate Z axis (local) to bank
        groupRef.current.rotateZ(currentRollRef.current)
        
        speedRef.current = currentSpeed
    })
    
    const fireAtPlayer = (pos, direction) => {
        useGameStore.getState().addLaser({
            startPosition: [pos.x, pos.y, pos.z],
            direction: direction.clone(),
            owner: 'enemy',
            color: '#ff0000',
            speed: 60,
            lifetime: 3
        })
        
        // Play laser sound with 3D positioning (uses SFX_VOLUMES.enemyLaser)
        useAudioStore.getState().playLaser3D({ x: pos.x, y: pos.y, z: pos.z })
    }
    
    return (
        <group ref={groupRef}>
            <primitive 
                object={enemyModel} 
                scale={modelScale}
                rotation={[0, Math.PI, 0]}
            />
            {/* Engine glow - positioned behind the ship */}
            <group position={engineGlowPosition}>
                <EnemyEngineGlow speedRef={speedRef} size={engineGlowSize} opacity={1.0} layers={3} />
            </group>
        </group>
    )
}

useGLTF.preload('/ennemy_spaceship-opt.glb')
