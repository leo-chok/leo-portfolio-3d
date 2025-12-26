import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useCameraStore } from '../../../stores/cameraStore'
import { EngineGlow } from '../../../game'
import { HudReticle } from '../hud3d/HudReticle'
import { HudCallout } from '../hud3d/HudCallout'
import * as THREE from 'three'

/**
 * Mothership - Autonomous NPC cargo ship
 * 
 * Simple wandering behavior:
 * - Picks random points in space
 * - Slowly moves toward them
 * - Avoids the center (sun)
 * - Gentle sinusoidal wobble for organic feel
 */
export const Mothership = () => {
    const groupRef = useRef()
    const modelRef = useRef()
    const { scene } = useGLTF('/mothership-draco.glb')
    const [hovered, setHovered] = useState(false)
    
    // Camera store for tracking
    const setTrackedRef = useCameraStore(state => state.setTrackedRef)
    const trackedRef = useCameraStore(state => state.trackedRef)
    const stopTracking = useCameraStore(state => state.stopTracking)
    
    // Check if we're being tracked
    const isTracked = trackedRef?.current === groupRef.current
    
    // Register with body registry for camera tracking
    const registerBody = useCameraStore(state => state.registerBody)
    
    // Movement state (refs to avoid re-renders)
    const positionRef = useRef(new THREE.Vector3(60, 15, 40))
    const targetRef = useRef(new THREE.Vector3(-60, 10, -40))
    const timeRef = useRef(0)
    const lastTargetChangeRef = useRef(0)
    
    // Config - easy to adjust
    const config = useMemo(() => ({
        speed: 0.5,               // Units per second (slow cruise)
        minTimeBetweenTargets: 20, // Minimum seconds before picking new target
        minRadius: 35,            // Minimum distance from sun (avoid center)
        maxRadius: 130,            // Maximum distance from origin
        minY: 5,                  // Minimum height
        maxY: 25,                 // Maximum height
        wobbleAmount: 0.3,        // Sinusoidal wobble intensity (reduced)
        wobbleSpeed: 0.5,         // Wobble frequency (slower)
        hitboxSize: 5,            // Clickable area size
    }), [])
    
    // Register this ship with the body registry
    useMemo(() => {
        if (groupRef.current) {
            registerBody('mothership', groupRef, 3, null)
        }
    }, [registerBody])
    
    // Pick a new random target point (far away from current position)
    const pickNewTarget = () => {
        let x, y, z, distance, distFromCurrent
        const currentPos = positionRef.current
        
        // Keep trying until we get a point that:
        // 1. Avoids the sun
        // 2. Is far enough from current position for a long journey
        do {
            x = (Math.random() - 0.5) * config.maxRadius * 2
            z = (Math.random() - 0.5) * config.maxRadius * 2
            y = config.minY + Math.random() * (config.maxY - config.minY)
            distance = Math.sqrt(x * x + z * z)
            distFromCurrent = Math.sqrt(
                Math.pow(x - currentPos.x, 2) + 
                Math.pow(z - currentPos.z, 2)
            )
        } while (distance < config.minRadius || distFromCurrent < 50)
        
        targetRef.current.set(x, y, z)
        lastTargetChangeRef.current = timeRef.current
    }
    
    // Main animation loop
    useFrame((state, delta) => {
        if (!groupRef.current || !modelRef.current) return
        
        timeRef.current += delta
        
        const currentPos = positionRef.current
        const target = targetRef.current
        
        // Calculate direction to target
        const direction = new THREE.Vector3().subVectors(target, currentPos)
        const distance = direction.length()
        
        // Time since last target change
        const timeSinceLastChange = timeRef.current - lastTargetChangeRef.current
        
        // Check if should pick new target (arrived OR minimum time passed)
        if (distance < 5 && timeSinceLastChange > config.minTimeBetweenTargets) {
            pickNewTarget()
        }
        
        // Always move towards current target
        if (distance > 1) {
            direction.normalize()
            const moveAmount = config.speed * delta
            currentPos.add(direction.clone().multiplyScalar(Math.min(moveAmount, distance)))
        }
        
        // Add sinusoidal wobble for organic movement
        const wobbleY = Math.sin(timeRef.current * config.wobbleSpeed) * config.wobbleAmount
        const wobbleX = Math.cos(timeRef.current * config.wobbleSpeed * 0.7) * config.wobbleAmount * 0.3
        
        // Apply position with wobble
        groupRef.current.position.set(
            currentPos.x + wobbleX,
            currentPos.y + wobbleY,
            currentPos.z
        )
        
        // Smooth rotation using quaternion slerp (gradual turn, no jerky lookAt)
        if (distance > 2) {
            const targetQuat = new THREE.Quaternion()
            const lookMatrix = new THREE.Matrix4()
            const lookTarget = currentPos.clone().add(direction.clone().normalize().multiplyScalar(10))
            lookMatrix.lookAt(currentPos, lookTarget, new THREE.Vector3(0, 1, 0))
            targetQuat.setFromRotationMatrix(lookMatrix)
            
            // Add 180° Y rotation to flip the model (nose was facing backwards)
            const flipQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
            targetQuat.multiply(flipQuat)
            
            // Very slow slerp for gradual smooth rotation
            modelRef.current.quaternion.slerp(targetQuat, 0.02)
        }
    })
    
    // Clone scene for this instance
    const clonedScene = useMemo(() => scene.clone(), [scene])
    
    // Hover handlers
    const handlePointerOver = (e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
    }
    
    const handlePointerOut = () => {
        setHovered(false)
        document.body.style.cursor = 'auto'
    }
    
    // Click handler for camera tracking
    const handleClick = (e) => {
        e.stopPropagation()
        if (isTracked) {
            // Already tracking, stop
            stopTracking()
        } else {
            // Start tracking this ship
            setTrackedRef(groupRef, 3, 'mothership', null)
        }
    }
    
    return (
        <group ref={groupRef}>
            {/* Invisible hitbox for hover detection */}
            <mesh
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onClick={handleClick}
            >
                <boxGeometry args={[config.hitboxSize, config.hitboxSize, config.hitboxSize]} />
                <meshBasicMaterial visible={false} />
            </mesh>
            
            <group ref={modelRef}>
                <primitive 
                    object={clonedScene} 
                    scale={[0.05, 0.05, 0.05]}
                />
                
                {/* Left engine */}
                <group position={[-0.05, 0, -0.45]}>
                    <EngineGlow 
                        color="#4488ff"
                        size={0.25}
                        opacity={0.9}
                        layers={3}
                        isBoosting={false}
                    />
                </group>
                
                {/* Right engine */}
                <group position={[0.05, 0, -0.45]}>
                    <EngineGlow 
                        color="#4488ff"
                        size={0.25}
                        opacity={0.9}
                        layers={3}
                        isBoosting={false}
                    />
                </group>
            </group>
            
            {/* HUD Elements */}
            <HudReticle 
                radius={2} 
                visible={hovered || isTracked} 
                isTracked={isTracked}
            />
            <HudCallout 
                name="MOTHERSHIP" 
                sectionId="mothership"
                visible={hovered || isTracked} 
                offset={[3, 2, 0]}
                classification="CARGO VESSEL"
            />
        </group>
    )
}

// Preload model
useGLTF.preload('/mothership-draco.glb')
