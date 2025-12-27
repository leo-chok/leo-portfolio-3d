import { useRef, useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useSpaceshipStore } from '../../../stores/spaceshipStore'
import { useCameraStore } from '../../../stores/cameraStore'
import { ShipDust, EngineGlow, ExplosionEffect } from '../effects'
import { ShipHUD3D, Crosshair } from './hud'
import * as THREE from 'three'

/**
 * SpaceshipController - Main spaceship component
 * 
 * Features:
 * - Loads spaceship.glb model (very small scale for epic feel)
 * - Arrow key controls for pitch/yaw
 * - Space for boost
 * - T to exit mode
 * - Auto-forward movement with inertia
 * 
 * Performance optimizations:
 * - Reusable THREE objects to avoid garbage collection
 * - Throttled store updates to prevent re-renders
 */
export const SpaceshipController = forwardRef((props, ref) => {
    const groupRef = useRef()
    
    // Expose groupRef to parent for camera follow
    useImperativeHandle(ref, () => groupRef.current)
    const velocityRef = useRef(new THREE.Vector3(0, 0, 0))
    const rotationVelocityRef = useRef({ pitch: 0, roll: 0 })
    
    // === REUSABLE THREE OBJECTS (avoid garbage collection) ===
    const tempObjects = useRef({
        forward: new THREE.Vector3(),
        pitchQuat: new THREE.Quaternion(),
        rollQuat: new THREE.Quaternion(),
        pitchAxis: new THREE.Vector3(1, 0, 0),
        rollAxis: new THREE.Vector3(0, 0, 1),
        pushBack: new THREE.Vector3(),
        deltaVelocity: new THREE.Vector3(),
    })
    
    // === THROTTLE REFS (to avoid unnecessary store updates) ===
    const lastStoreUpdate = useRef({
        speed: -1,
        barrierIntensity: -1,
        positionX: 0,
        positionY: 0,
        positionZ: 0,
    })
    
    // Load spaceship model
    const { scene } = useGLTF('/spaceship-draco.glb')
    
    // Subscribe to spawn count to trigger repositioning on each spaceship mode entry
    const spawnCount = useSpaceshipStore(state => state.spawnCount)
    
    // Position ship next to Mothership on each spaceship mode activation
    useEffect(() => {
        if (!groupRef.current) return
        
        const bodyRegistry = useCameraStore.getState().bodyRegistry
        const mothership = bodyRegistry['mothership']
        
        if (mothership?.ref?.current) {
            // Get mothership world position
            const mothershipPos = new THREE.Vector3()
            mothership.ref.current.getWorldPosition(mothershipPos)
            // Spawn 3 units to the left of mothership
            groupRef.current.position.set(
                mothershipPos.x - 3,
                mothershipPos.y,
                mothershipPos.z
            )
        } else {
            // Fallback position if mothership not yet registered
            groupRef.current.position.set(55, 15, 40)
        }
    }, [spawnCount]) // Re-run every time spawnCount changes (each mode entry)
    
    // Explosions state for testing
    const [explosions, setExplosions] = useState([])
    const explosionIdRef = useRef(0)
    
    // Remove explosion when complete
    const handleExplosionComplete = (id) => {
        setExplosions(prev => prev.filter(exp => exp.id !== id))
    }
    
    // Store state - get functions only once, not values that change
    // Store actions only - no reactive state to avoid re-renders!
    const setSpeed = useSpaceshipStore(state => state.setSpeed)
    const setBoosting = useSpaceshipStore(state => state.setBoosting)
    const updatePosition = useSpaceshipStore(state => state.updatePosition)
    const setBarrierIntensity = useSpaceshipStore(state => state.setBarrierIntensity)
    const die = useSpaceshipStore(state => state.die)
    
    // Input state
    const keysRef = useRef({
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        Shift: false,      // Accelerate
        ControlLeft: false // Decelerate
    })
    
    // Target speed ref (0-1117 km/h = 0-310 m/s approx in scene units)
    const targetSpeedRef = useRef(0)
    
    // Configuration
    const config = useMemo(() => ({
        // Ship is VERY small for epic scale feeling
        shipScale: 0.01,
        
        // Speed settings
        // - Max speed: 1117 km/h (displayed)
        // - 40 seconds to traverse scene diameter (270 units) at max speed
        // - 4 seconds to go from 0 to max speed while holding Shift
        maxSpeedKmh: 1117,            // Max speed in km/h
        speedToUnits: 0.00604,        // Conversion: 1117 km/h = 6.75 units/s → 6.75/1117
        throttleRate: 280,            // km/h per second while holding Shift (1117/4 = ~280)
        brakeRate: 400,               // km/h per second while holding Ctrl (faster braking)
        
        // Rotation (radians per second squared - accelerates rotation velocity)
        rotationSpeed: 6.0,
        rotationDamping: 0.92,
        
        // Boundary: slowdown 120→140, barrier visual at 160
        boundaryRadius: 140,
        boundarySlowdownStart: 120, // Lower = earlier barrier warning/slowdown
        
        // Throttle thresholds for store updates
        speedThreshold: 1,
        barrierThreshold: 0.05,
        positionThreshold: 0.5,
    }), [])
    
    // Clone scene to avoid shared state issues
    const spaceshipModel = useMemo(() => {
        const clonedScene = scene.clone()
        clonedScene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
        return clonedScene
    }, [scene])
    
    // Keyboard event handlers - Shift/Ctrl held continuously for acceleration
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'ArrowUp') keysRef.current.ArrowUp = true
            if (e.code === 'ArrowDown') keysRef.current.ArrowDown = true
            if (e.code === 'ArrowLeft') keysRef.current.ArrowLeft = true
            if (e.code === 'ArrowRight') keysRef.current.ArrowRight = true
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                keysRef.current.Shift = true
                setBoosting(true)
            }
            if (e.code === 'ControlLeft') keysRef.current.ControlLeft = true
            if (e.code === 'KeyT') {
                useSpaceshipStore.getState().exitSpaceshipMode()
            }
            // Space = spawn explosion in front of ship (for testing)
            if (e.code === 'Space' && groupRef.current) {
                e.preventDefault()
                // Get ship position and forward direction
                const shipPos = groupRef.current.position.clone()
                const forward = new THREE.Vector3(0, 0, -1)
                forward.applyQuaternion(groupRef.current.quaternion)
                // Spawn explosion 8 units in front of ship
                const explosionPos = shipPos.add(forward.multiplyScalar(1))
                
                explosionIdRef.current += 1
                setExplosions(prev => [...prev, {
                    id: explosionIdRef.current,
                    position: [explosionPos.x, explosionPos.y, explosionPos.z]
                }])
            }
        }
        
        const handleKeyUp = (e) => {
            if (e.code === 'ArrowUp') keysRef.current.ArrowUp = false
            if (e.code === 'ArrowDown') keysRef.current.ArrowDown = false
            if (e.code === 'ArrowLeft') keysRef.current.ArrowLeft = false
            if (e.code === 'ArrowRight') keysRef.current.ArrowRight = false
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                keysRef.current.Shift = false
                setBoosting(false)
            }
            if (e.code === 'ControlLeft') keysRef.current.ControlLeft = false
        }
        
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [setBoosting])
    
    // Main update loop - priority -1 ensures this runs BEFORE camera controller
    useFrame((state, delta) => {
        if (!groupRef.current) return
        
        // Stop all movement if dead
        const isDead = useSpaceshipStore.getState().isDead
        if (isDead) {
            // Hide the ship model
            groupRef.current.visible = false
            return
        }
        // Make sure ship is visible when alive
        groupRef.current.visible = true
        
        const keys = keysRef.current
        const rotVel = rotationVelocityRef.current
        const temp = tempObjects.current
        const lastUpdate = lastStoreUpdate.current
        
        // === ROTATION (Quaternion-based for proper local axes) ===
        // Roll (left/right) - barrel roll around local Z axis
        if (keys.ArrowLeft) rotVel.roll += config.rotationSpeed * delta
        if (keys.ArrowRight) rotVel.roll -= config.rotationSpeed * delta
        
        // Pitch (up/down) - nose up/down around local X axis
        // ArrowUp = nose DOWN, ArrowDown = nose UP (inverted for natural feel)
        if (keys.ArrowUp) rotVel.pitch -= config.rotationSpeed * delta
        if (keys.ArrowDown) rotVel.pitch += config.rotationSpeed * delta
        
        // Apply rotation damping (FPS-independent: scale to 60fps baseline)
        const rotDampingFactor = Math.pow(config.rotationDamping, delta * 60)
        rotVel.roll *= rotDampingFactor
        rotVel.pitch *= rotDampingFactor
        
        // Reuse quaternions instead of creating new ones
        // Multiply by delta for frame-rate independent rotation
        temp.pitchQuat.setFromAxisAngle(temp.pitchAxis, rotVel.pitch * delta)
        temp.rollQuat.setFromAxisAngle(temp.rollAxis, rotVel.roll * delta)
        
        // Apply rotations: current * pitch * roll (order matters!)
        groupRef.current.quaternion.multiply(temp.pitchQuat)
        groupRef.current.quaternion.multiply(temp.rollQuat)
        groupRef.current.quaternion.normalize() // Prevent drift
        
        // === MOVEMENT ===
        // Get forward direction from ship rotation (reuse vector)
        temp.forward.set(0, 0, -1)
        temp.forward.applyQuaternion(groupRef.current.quaternion)
        
        // === THROTTLE CONTROL ===
        // Shift = accelerate, ControlLeft = decelerate (continuous while held)
        if (keys.Shift) {
            targetSpeedRef.current += config.throttleRate * delta
        }
        if (keys.ControlLeft) {
            targetSpeedRef.current -= config.brakeRate * delta
        }
        
        // Clamp target speed to 0 - maxSpeedKmh
        if (targetSpeedRef.current > config.maxSpeedKmh) {
            targetSpeedRef.current = config.maxSpeedKmh
        }
        if (targetSpeedRef.current < 0) {
            targetSpeedRef.current = 0
        }
        
        // Convert km/h to scene units
        const targetSpeedUnits = targetSpeedRef.current * config.speedToUnits
        
        // Set velocity directly in forward direction
        velocityRef.current.copy(temp.forward).multiplyScalar(targetSpeedUnits)
        
        // === BOUNDARY CHECK ===
        const currentPos = groupRef.current.position
        const distanceFromCenter = currentPos.length()
        
        // Calculate boundary slowdown factor
        let boundaryFactor = 1
        if (distanceFromCenter > config.boundarySlowdownStart) {
            // Progressive slowdown from boundarySlowdownStart to boundaryRadius
            const slowdownRange = config.boundaryRadius - config.boundarySlowdownStart
            const progressIntoSlowdown = distanceFromCenter - config.boundarySlowdownStart
            boundaryFactor = Math.max(0, 1 - (progressIntoSlowdown / slowdownRange))
        }
        
        // === THROTTLED STORE UPDATES ===
        const newBarrierIntensity = 1 - boundaryFactor
        if (Math.abs(newBarrierIntensity - lastUpdate.barrierIntensity) >= config.barrierThreshold) {
            setBarrierIntensity(newBarrierIntensity)
            lastUpdate.barrierIntensity = newBarrierIntensity
        }
        
        // Apply boundary slowdown to velocity
        velocityRef.current.multiplyScalar(boundaryFactor)
        
        // Hard stop at boundary - only block OUTWARD movement
        const stopRadius = config.boundaryRadius - 2
        if (distanceFromCenter >= stopRadius) {
            // Check if moving outward (away from center)
            const movingOutward = velocityRef.current.dot(currentPos) > 0
            if (movingOutward) {
                velocityRef.current.set(0, 0, 0)
            }
            // Don't reset targetSpeedRef so player can accelerate to leave
        }
        
        // Apply velocity to position
        temp.deltaVelocity.copy(velocityRef.current).multiplyScalar(delta)
        groupRef.current.position.add(temp.deltaVelocity)
        
        // === COLLISION DETECTION ===
        // Check if player already dead (avoid multiple triggers)
        if (!useSpaceshipStore.getState().isDead) {
            const shipPos = groupRef.current.position
            const bodyRegistry = useCameraStore.getState().bodyRegistry
            
            // Check each celestial body
            for (const [id, body] of Object.entries(bodyRegistry)) {
                if (!body.ref?.current) continue
                
                // Get body world position
                temp.deltaVelocity.setFromMatrixPosition(body.ref.current.matrixWorld)
                
                // Calculate distance to ship
                const dx = shipPos.x - temp.deltaVelocity.x
                const dy = shipPos.y - temp.deltaVelocity.y
                const dz = shipPos.z - temp.deltaVelocity.z
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
                
                // Collision radius varies by body type
                // Sun uses size * 0.6 for its geometry, others use full size
                let collisionRadius
                if (id === 'presentation') {
                    // Sun: geometry is size * 0.6, add small margin
                    collisionRadius = (body.size || 1) * 0.7
                } else {
                    // Planets, moons, mothership: use full size
                    collisionRadius = (body.size || 1) * 1.0
                }
                
                if (distance < collisionRadius) {
                    // COLLISION! Trigger death
                    const deathPos = [shipPos.x, shipPos.y, shipPos.z]
                    die(deathPos)
                    
                    // Spawn explosion at ship position
                    explosionIdRef.current += 1
                    setExplosions(prev => [...prev, {
                        id: explosionIdRef.current,
                        position: deathPos
                    }])
                    break // Only one collision needed
                }
            }
        }
        
        // === THROTTLED SPEED UPDATE (display in km/h) ===
        const displaySpeed = Math.round(targetSpeedRef.current * boundaryFactor)
        if (Math.abs(displaySpeed - lastUpdate.speed) >= config.speedThreshold) {
            setSpeed(displaySpeed)
            lastUpdate.speed = displaySpeed
        }
        
        // === THROTTLED POSITION UPDATE ===
        const pos = groupRef.current.position
        const posDelta = Math.abs(pos.x - lastUpdate.positionX) + 
                         Math.abs(pos.y - lastUpdate.positionY) + 
                         Math.abs(pos.z - lastUpdate.positionZ)
        if (posDelta >= config.positionThreshold) {
            updatePosition(pos.x, pos.y, pos.z)
            lastUpdate.positionX = pos.x
            lastUpdate.positionY = pos.y
            lastUpdate.positionZ = pos.z
        }
    }, -1) // Priority -1: run BEFORE default (0) priority - camera runs at default
    
    return (
        <>
        <group ref={groupRef}> {/* Position set by useEffect on mount */}
            <primitive 
                object={spaceshipModel} 
                scale={config.shipScale}
                rotation={[0, Math.PI, 0]}
            />
            
            {/* Engine glow - Left reactor (reads isBoosting from store internally) */}
            <group position={[-0.040, 0.017, 0.12]}>
                <EngineGlow color="#ff9944" size={0.05} opacity={0.9} layers={3} />
            </group>
            
            {/* Engine glow - Right reactor */}
            <group position={[0.040, 0.017, 0.12]}>
                <EngineGlow color="#ff9944" size={0.05} opacity={0.9} layers={3} />
            </group>
            
            {/* Ship dust particles - follows ship */}
            <ShipDust />
            
            {/* 3D HUD floating around ship */}
            <ShipHUD3D />
            
            {/* Targeting crosshair in front */}
            <Crosshair />
        </group>
        
        {/* Explosions in world space */}
        {explosions.map(exp => (
            <ExplosionEffect
                key={exp.id}
                position={exp.position}
                particleCount={40}
                size={0.4}
                duration={1.2}
                speed={4}
                onComplete={() => handleExplosionComplete(exp.id)}
            />
        ))}
        </>
    )
})

// Preload the model
useGLTF.preload('/spaceship-draco.glb')
