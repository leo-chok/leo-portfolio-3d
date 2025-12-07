import { useFrame, useThree } from '@react-three/fiber'
import { useCameraStore } from '../../stores/cameraStore'
import * as THREE from 'three'
import { useRef, useEffect } from 'react'

/**
 * CameraController Component
 * Handles smooth camera approach and tracking of celestial bodies
 * - Approach phase: smoothly flies to element's real-time position
 * - Tracking phase: follows the element maintaining distance
 */
export const CameraController = () => {
    const { camera } = useThree()
    const controls = useThree((state) => state.controls)
    
    const { trackedRef, isTracking, targetSize } = useCameraStore()
    
    // State refs
    const lastTargetPos = useRef(new THREE.Vector3())
    const isApproaching = useRef(true)
    const approachProgress = useRef(0)
    const previousTrackedRef = useRef(null)
    
    // Reset approach animation when tracked target changes
    useEffect(() => {
        if (trackedRef !== previousTrackedRef.current) {
            isApproaching.current = true
            approachProgress.current = 0
            previousTrackedRef.current = trackedRef
        }
    }, [trackedRef])
    
    // Initial/overview camera position
    const OVERVIEW_POSITION = new THREE.Vector3(0, 10, 40)
    const OVERVIEW_TARGET = new THREE.Vector3(0, 0, 0)
    const returnProgress = useRef(0)
    
    const { isReturningToOverview, clearReturningToOverview } = useCameraStore()
    
    useFrame((state, delta) => {
        if (!controls) return
        
        // ===== RETURN TO OVERVIEW =====
        if (isReturningToOverview) {
            returnProgress.current += delta * 0.15
            
            const t = Math.min(returnProgress.current, 1)
            const easeOut = 1 - Math.pow(1 - t, 3)
            
            const lerpFactor = 0.02 + easeOut * 0.03
            
            camera.position.lerp(OVERVIEW_POSITION, lerpFactor)
            controls.target.lerp(OVERVIEW_TARGET, lerpFactor)
            
            // Check if arrived
            const distance = camera.position.distanceTo(OVERVIEW_POSITION)
            if (distance < 1 || returnProgress.current > 3) {
                clearReturningToOverview()
                returnProgress.current = 0
                controls.autoRotate = true
            }
            
            controls.update()
            return
        }
        
        returnProgress.current = 0
        
        if (!isTracking || !trackedRef?.current) {
            // Reset when not tracking
            isApproaching.current = true
            approachProgress.current = 0
            return
        }
        
        // Get current world position of tracked object
        const worldPos = new THREE.Vector3()
        trackedRef.current.getWorldPosition(worldPos)
        
        // Calculate desired camera position (offset from target)
        const size = targetSize || 1.5
        const desiredOffset = new THREE.Vector3(0, size * 3, size * 8)
        const desiredCamPos = worldPos.clone().add(desiredOffset)
        
        if (isApproaching.current) {
            // ===== APPROACH PHASE =====
            // Smoothly lerp camera toward real-time target position
            approachProgress.current += delta * 0.1 // Slower approach
            
            // Ease-in-out cubic function for smooth acceleration/deceleration
            const t = Math.min(approachProgress.current / 4, 1) // Normalize to 0-1 over ~4 seconds
            const easeInOut = t < 0.5 
                ? 4 * t * t * t 
                : 1 - Math.pow(-2 * t + 2, 3) / 2
            
            // Lerp factor based on easing (slower start and end)
            const lerpFactor = 0.01 + easeInOut * 0.04
            
            camera.position.lerp(desiredCamPos, lerpFactor)
            controls.target.lerp(worldPos, lerpFactor * 1.2)
            
            // Check if close enough to switch to tracking mode
            const distance = camera.position.distanceTo(desiredCamPos)
            if (distance < 1.5 || approachProgress.current > 5) {
                isApproaching.current = false
                lastTargetPos.current.copy(worldPos)
            }
        } else {
            // ===== TRACKING PHASE =====
            // Calculate how much the target moved since last frame
            const moveDelta = new THREE.Vector3().subVectors(worldPos, lastTargetPos.current)
            
            // Move camera by the same delta (follow the element)
            camera.position.add(moveDelta)
            
            // Update target smoothly
            controls.target.lerp(worldPos, 0.15)
            
            // Remember position for next frame
            lastTargetPos.current.copy(worldPos)
        }
        
        controls.update()
    })
    
    return null
}

