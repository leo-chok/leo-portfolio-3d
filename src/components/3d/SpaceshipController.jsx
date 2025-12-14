import { useRef, useEffect, useMemo, forwardRef, useImperativeHandle, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useSpaceshipStore } from '../../stores/spaceshipStore'
import { ShipDust } from './ShipDust'
import { EngineGlow } from './EngineGlow'
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
 */
export const SpaceshipController = forwardRef((props, ref) => {
    const groupRef = useRef()
    
    // Expose groupRef to parent for camera follow
    useImperativeHandle(ref, () => groupRef.current)
    const velocityRef = useRef(new THREE.Vector3(0, 0, 0))
    const rotationVelocityRef = useRef({ pitch: 0, roll: 0 })
    
    // Load spaceship model
    const { scene } = useGLTF('/spaceship.glb')
    
    // Store state
    const setSpeed = useSpaceshipStore(state => state.setSpeed)
    const setBoosting = useSpaceshipStore(state => state.setBoosting)
    const isBoosting = useSpaceshipStore(state => state.isBoosting)
    const updatePosition = useSpaceshipStore(state => state.updatePosition)
    const setBarrierIntensity = useSpaceshipStore(state => state.setBarrierIntensity)
    const exitSpaceshipMode = useSpaceshipStore(state => state.exitSpaceshipMode)
    const maxSpeed = useSpaceshipStore(state => state.maxSpeed)
    const boostMultiplier = useSpaceshipStore(state => state.boostMultiplier)
    
    // Input state
    const keysRef = useRef({
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        Space: false
    })
    
    // Configuration
    const config = useMemo(() => ({
        // Ship is VERY small for epic scale feeling
        shipScale: 0.01,
        
        // Movement - reduced for slower default speed
        acceleration: 5,
        deceleration: 0.98,
        rotationSpeed: .1,
        rotationDamping: 0.92,
        
        // Boost
        boostAcceleration: 10,
        
        // Boundary (planets go up to 130, so 155 gives good margin)
        boundaryRadius: 155,
        boundarySlowdownStart: 135, // Start slowing down at this radius
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
    
    // Keyboard event handlers
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'ArrowUp') keysRef.current.ArrowUp = true
            if (e.code === 'ArrowDown') keysRef.current.ArrowDown = true
            if (e.code === 'ArrowLeft') keysRef.current.ArrowLeft = true
            if (e.code === 'ArrowRight') keysRef.current.ArrowRight = true
            if (e.code === 'Space') {
                keysRef.current.Space = true
                setBoosting(true)
            }
            if (e.code === 'KeyT') {
                exitSpaceshipMode()
            }
        }
        
        const handleKeyUp = (e) => {
            if (e.code === 'ArrowUp') keysRef.current.ArrowUp = false
            if (e.code === 'ArrowDown') keysRef.current.ArrowDown = false
            if (e.code === 'ArrowLeft') keysRef.current.ArrowLeft = false
            if (e.code === 'ArrowRight') keysRef.current.ArrowRight = false
            if (e.code === 'Space') {
                keysRef.current.Space = false
                setBoosting(false)
            }
        }
        
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [setBoosting, exitSpaceshipMode])
    
    // Main update loop
    useFrame((state, delta) => {
        if (!groupRef.current) return
        
        const keys = keysRef.current
        const rotVel = rotationVelocityRef.current
        
        // === ROTATION (Quaternion-based for proper local axes) ===
        // Roll (left/right) - barrel roll around local Z axis
        if (keys.ArrowLeft) rotVel.roll += config.rotationSpeed * delta
        if (keys.ArrowRight) rotVel.roll -= config.rotationSpeed * delta
        
        // Pitch (up/down) - nose up/down around local X axis
        // ArrowUp = nose DOWN, ArrowDown = nose UP (inverted for natural feel)
        if (keys.ArrowUp) rotVel.pitch -= config.rotationSpeed * delta
        if (keys.ArrowDown) rotVel.pitch += config.rotationSpeed * delta
        
        // Apply rotation damping
        rotVel.roll *= config.rotationDamping
        rotVel.pitch *= config.rotationDamping
        
        // Create incremental rotation quaternions around LOCAL axes
        const pitchQuat = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(1, 0, 0), // Local X axis
            rotVel.pitch
        )
        const rollQuat = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 0, 1), // Local Z axis
            rotVel.roll
        )
        
        // Apply rotations: current * pitch * roll (order matters!)
        groupRef.current.quaternion.multiply(pitchQuat)
        groupRef.current.quaternion.multiply(rollQuat)
        groupRef.current.quaternion.normalize() // Prevent drift
        
        // === MOVEMENT ===
        // Get forward direction from ship rotation
        const forward = new THREE.Vector3(0, 0, -1)
        forward.applyQuaternion(groupRef.current.quaternion)
        
        // Calculate acceleration based on boost
        const accel = keys.Space 
            ? config.boostAcceleration 
            : config.acceleration
        
        // Calculate max speed based on boost
        const currentMaxSpeed = keys.Space 
            ? maxSpeed * boostMultiplier 
            : maxSpeed
        
        // Accelerate forward
        velocityRef.current.add(forward.multiplyScalar(accel * delta))
        
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
        
        // Update barrier intensity for visual effect (via store for reactivity)
        setBarrierIntensity(1 - boundaryFactor)
        
        // Apply boundary slowdown to velocity
        velocityRef.current.multiplyScalar(boundaryFactor)
        
        // Hard stop BEFORE boundary (give margin to reverse)
        const stopRadius = config.boundaryRadius - 2
        if (distanceFromCenter >= stopRadius) {
            // Push back inside the stop radius
            const pushBack = currentPos.clone().normalize().multiplyScalar(stopRadius - 1)
            groupRef.current.position.copy(pushBack)
            velocityRef.current.set(0, 0, 0)
        }
        
        // Clamp to max speed (after boundary factor)
        const speed = velocityRef.current.length()
        const effectiveMaxSpeed = currentMaxSpeed * boundaryFactor
        if (speed > effectiveMaxSpeed) {
            velocityRef.current.normalize().multiplyScalar(effectiveMaxSpeed)
        }
        
        // Apply velocity to position
        groupRef.current.position.add(velocityRef.current.clone().multiplyScalar(delta))
        
        // Apply deceleration (drag)
        velocityRef.current.multiplyScalar(config.deceleration)
        
        // Update store with current speed (in m/s) - affected by boundary
        setSpeed(Math.round(speed * boundaryFactor))
        
        // Update position for collision detection
        const pos = groupRef.current.position
        updatePosition(pos.x, pos.y, pos.z)
    })
    
    return (
        <group ref={groupRef} position={[0, 0, 40]}>
            <primitive 
                object={spaceshipModel} 
                scale={config.shipScale}
                rotation={[0, Math.PI, 0]}
            />
            
            {/* Engine glow - Left reactor */}
            <group position={[-0.040, 0.017, 0.12]}>
                <EngineGlow color="#ff9944" size={0.05} opacity={0.9} layers={3} isBoosting={isBoosting} />
            </group>
            
            {/* Engine glow - Right reactor */}
            <group position={[0.040, 0.017, 0.12]}>
                <EngineGlow color="#ff9944" size={0.05} opacity={0.9} layers={3} isBoosting={isBoosting} />
            </group>
            
            {/* Ship dust particles - follows ship */}
            <ShipDust />
        </group>
    )
})

// Preload the model
useGLTF.preload('/spaceship.glb')
