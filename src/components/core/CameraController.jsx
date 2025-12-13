import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'

// Import store with individual selectors for optimization
import { useCameraStore } from '../../stores/cameraStore'

// ============================================
// PRE-ALLOCATED VECTORS (avoid GC in useFrame)
// ============================================
const _worldPos = new THREE.Vector3()
const _desiredCamPos = new THREE.Vector3()
const _moveDelta = new THREE.Vector3()
const _overviewPos = new THREE.Vector3(0, 25, 80)
const _overviewTarget = new THREE.Vector3(0, 0, 0)

/**
 * CameraController - Unified Camera System
 * 
 * Handles ALL camera operations:
 * - Intro cinematic animation (on startAnimation=true)
 * - Tracking celestial bodies (approach + follow)
 * - Return to overview
 * 
 * Optimizations:
 * - Pre-allocated Vector3 (no allocations in render loop)
 * - Individual Zustand selectors (minimal re-renders)
 * - Single controls.update() call per frame
 */
export const CameraController = ({ startAnimation = false }) => {
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
        
        // Set starting position
        camera.position.set(0, 80, 250)
        camera.lookAt(0, 0, 0)
        controls.target.set(0, 0, 0)
        
        // Animate to overview position
        gsap.to(camera.position, {
            x: 0,
            y: 10,
            z: 40,
            duration: 5,
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
            // Only update the target to follow the celestial body
            // Let the user freely orbit around it
            controls.target.lerp(_worldPos, 0.1)
            
            // Remember position for next frame
            lastTargetPos.current.copy(_worldPos)
        }
        
        controls.update()
    })
    
    return null
}
