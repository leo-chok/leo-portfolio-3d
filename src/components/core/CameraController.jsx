import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

// Import stores with individual selectors for optimization
import { useCameraStore } from '../../stores/cameraStore'
import { useSpaceshipStore } from '../../stores/spaceshipStore'

// ============================================
// PRE-ALLOCATED VECTORS (avoid GC in useFrame)
// ============================================
const _worldPos = new THREE.Vector3()
const _desiredCamPos = new THREE.Vector3()
const _moveDelta = new THREE.Vector3()
const _overviewPos = new THREE.Vector3(0, 40, 120)
const _overviewTarget = new THREE.Vector3(0, 0, 0)
const _shipCamOffset = new THREE.Vector3(0, 0.1, 0.5) // Much closer: behind and slightly above ship
const _shipLookAhead = new THREE.Vector3(0, 0, -2) // Look ahead of ship
// Reusable vectors for spaceship camera (avoid GC)
const _tempOffset = new THREE.Vector3()
const _tempLookTarget = new THREE.Vector3()
const _tempShipUp = new THREE.Vector3()

/**
 * CameraController - Unified Camera System
 * 
 * Handles ALL camera operations:
 * - Intro cinematic animation (on startAnimation=true)
 * - Tracking celestial bodies (approach + follow)
 * - Return to overview
 * - Spaceship 3rd person follow mode
 * 
 * Optimizations:
 * - Pre-allocated Vector3 (no allocations in render loop)
 * - Individual Zustand selectors (minimal re-renders)
 * - Single controls.update() call per frame
 */
export const CameraController = ({ startAnimation = false, shipRef }) => {
    const { camera } = useThree()
    const controls = useThree((state) => state.controls)
    
    // === OPTIMIZED ZUSTAND SELECTORS ===
    const trackedRef = useCameraStore(state => state.trackedRef)
    const isTracking = useCameraStore(state => state.isTracking)
    const targetSize = useCameraStore(state => state.targetSize)
    const isReturningToOverview = useCameraStore(state => state.isReturningToOverview)
    const clearReturningToOverview = useCameraStore(state => state.clearReturningToOverview)
    
    // === STATE REFS ===
    const lastTargetPos = useRef(new THREE.Vector3())
    const isApproaching = useRef(true)
    const approachProgress = useRef(0)
    const previousTrackedRef = useRef(null)
    const returnProgress = useRef(0)
    
    // === SPACESHIP MODE ===
    const isSpaceshipMode = useSpaceshipStore(state => state.isSpaceshipMode)
    const shipCameraLag = useRef(new THREE.Vector3())
    
    // === INTRO ANIMATION STATE ===
    const introPlayed = useRef(false)
    const introActive = useRef(false)
    
    // Reset approach when tracked target changes
    useEffect(() => {
        if (trackedRef !== previousTrackedRef.current) {
            isApproaching.current = true
            approachProgress.current = 0
            previousTrackedRef.current = trackedRef
            
            // Disable autoRotate when tracking a celestial body
            if (controls && trackedRef) {
                controls.autoRotate = false
            }
        }
    }, [trackedRef, controls])
    
    // === INTRO ANIMATION (runs once when startAnimation becomes true) ===
    useEffect(() => {
        if (!startAnimation || !controls || introPlayed.current) return
        introPlayed.current = true
        introActive.current = true
        
        // Disable controls during intro
        controls.enabled = false
        controls.autoRotate = false
        
        // Set starting position - very far away
        camera.position.set(0, 200, 500)
        camera.lookAt(0, 0, 0)
        controls.target.set(0, 0, 0)
        
        // Animate to overview position
        gsap.to(camera.position, {
            x: _overviewPos.x,
            y: _overviewPos.y,
            z: _overviewPos.z,
            duration: 6,
            ease: "power2.inOut",
            onUpdate: () => {
                camera.lookAt(0, 0, 0)
            },
            onComplete: () => {
                introActive.current = false
                controls.enabled = true
                controls.autoRotate = true
                controls.autoRotateSpeed = 0.3
            }
        })
    }, [startAnimation, camera, controls])
    
    // === MAIN FRAME LOOP ===
    useFrame((state, delta) => {
        if (!controls || introActive.current) return
        
        // ===== SPACESHIP MODE (Immersive 3rd person) =====
        if (isSpaceshipMode && shipRef?.current) {
            // Disable orbit controls in spaceship mode
            controls.enabled = false
            controls.autoRotate = false
            
            // Get ship world position and quaternion
            const shipPos = shipRef.current.position
            const shipQuat = shipRef.current.quaternion
            
            // Calculate desired camera position (behind and above ship, in ship's local space)
            // Reuse vectors instead of clone() to avoid GC
            _tempOffset.copy(_shipCamOffset).applyQuaternion(shipQuat)
            _desiredCamPos.copy(shipPos).add(_tempOffset)
            
            // Smooth camera position follow with lag
            const posLag = 0.1
            camera.position.lerp(_desiredCamPos, posLag)
            
            // === CAMERA SHAKE (speed-based amplitude, constant slow frequency) ===
            const speed = useSpaceshipStore.getState().speed
            const MAX_SPEED = 1117
            const speedFactor = Math.min(speed / MAX_SPEED, 1)
            
            // Base amplitude even at rest, increases with speed
            const baseAmplitude = 0.00008
            const speedAmplitude = speedFactor * 0.002
            const amplitude = baseAmplitude + speedAmplitude
            
            const time = state.clock.elapsedTime
            
            // Slow constant frequency for smooth organic movement
            const shakeX = (Math.sin(time * 2.5) * 0.6 + Math.sin(time * 4.1) * 0.4) * amplitude
            const shakeY = (Math.sin(time * 3.2) * 0.6 + Math.sin(time * 5.3) * 0.4) * amplitude
            
            camera.position.x += shakeX
            camera.position.y += shakeY
            
            // Calculate look target (ahead of ship in ship's local space)
            // Reuse vector instead of clone()
            _tempLookTarget.copy(_shipLookAhead).applyQuaternion(shipQuat).add(shipPos)
            
            // Make camera look at the target
            camera.lookAt(_tempLookTarget)
            
            // Apply ship's roll to camera (immersive rotation)
            _tempShipUp.set(0, 1, 0).applyQuaternion(shipQuat)
            camera.up.lerp(_tempShipUp, 0.08) // Smooth roll transition
            
            return
        } else if (!isSpaceshipMode && !controls.enabled) {
            // Re-enable controls when exiting spaceship mode
            controls.enabled = true
            // Reset camera up vector to default
            camera.up.set(0, 1, 0)
        }
        
        // ===== RETURN TO OVERVIEW =====
        if (isReturningToOverview) {
            returnProgress.current += delta * 0.15
            
            const t = Math.min(returnProgress.current, 1)
            const easeOut = 1 - Math.pow(1 - t, 3)
            const lerpFactor = 0.02 + easeOut * 0.03
            
            camera.position.lerp(_overviewPos, lerpFactor)
            controls.target.lerp(_overviewTarget, lerpFactor)
            
            // Check if arrived
            if (camera.position.distanceTo(_overviewPos) < 1 || returnProgress.current > 3) {
                clearReturningToOverview()
                returnProgress.current = 0
                controls.autoRotate = true
            }
            
            controls.update()
            return
        }
        
        returnProgress.current = 0
        
        // ===== NOT TRACKING - EARLY EXIT =====
        if (!isTracking || !trackedRef?.current) {
            isApproaching.current = true
            approachProgress.current = 0
            return
        }
        
        // ===== GET TARGET WORLD POSITION (reuse vector) =====
        trackedRef.current.getWorldPosition(_worldPos)
        
        // Calculate desired camera position
        const size = targetSize || 1.5
        _desiredCamPos.set(
            _worldPos.x,
            _worldPos.y + size * 3,
            _worldPos.z + size * 8
        )
        
        if (isApproaching.current) {
            // ===== APPROACH PHASE =====
            approachProgress.current += delta * 0.1
            
            const t = Math.min(approachProgress.current / 4, 1)
            const easeInOut = t < 0.5 
                ? 4 * t * t * t 
                : 1 - Math.pow(-2 * t + 2, 3) / 2
            
            const lerpFactor = 0.01 + easeInOut * 0.04
            
            camera.position.lerp(_desiredCamPos, lerpFactor)
            controls.target.lerp(_worldPos, lerpFactor * 1.2)
            
            // Switch to tracking when close enough
            if (camera.position.distanceTo(_desiredCamPos) < 1.5 || approachProgress.current > 5) {
                isApproaching.current = false
                lastTargetPos.current.copy(_worldPos)
            }
        } else {
            // ===== TRACKING PHASE =====
            // Calculate how much the target moved since last frame
            const deltaPos = _worldPos.clone().sub(lastTargetPos.current)
            
            // Move camera along with the target (maintains orbit position)
            camera.position.add(deltaPos)
            
            // Update the orbit controls target to follow
            controls.target.lerp(_worldPos, 0.15)
            
            // Remember position for next frame
            lastTargetPos.current.copy(_worldPos)
        }
        
        controls.update()
    })
    
    return null
}
