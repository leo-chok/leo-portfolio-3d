import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { useSpaceshipStore } from '../../../../stores/spaceshipStore'
import { useGameStore } from '../../../../stores/gameStore'

/**
 * useShipInput - Keyboard input handling for spaceship
 * 
 * Handles:
 * - Arrow keys for rotation
 * - Shift for boost
 * - Ctrl for brake
 * - Space for firing
 * - T to exit mode
 */

// Wing cannon positions (local to ship)
const WING_LEFT = new THREE.Vector3(-0.1, 0, -0.05)
const WING_RIGHT = new THREE.Vector3(0.1, 0, -0.05)
const SHOT_COOLDOWN = 0.15 // seconds between shots

export function useShipInput(groupRef) {
    const setBoosting = useSpaceshipStore(state => state.setBoosting)
    
    // Input state
    const keysRef = useRef({
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        Shift: false,
        ControlLeft: false
    })
    
    // Shooting cooldown
    const lastShotTimeRef = useRef(0)
    
    // Fire lasers function
    const fireLasers = useCallback(() => {
        if (!groupRef?.current) return
        
        const now = performance.now() / 1000
        if (now - lastShotTimeRef.current < SHOT_COOLDOWN) return
        lastShotTimeRef.current = now
        
        const shipQuat = groupRef.current.quaternion.clone()
        const shipPos = groupRef.current.position.clone()
        
        // Get forward direction
        const forward = new THREE.Vector3(0, 0, -1)
        forward.applyQuaternion(shipQuat)
        
        // Use auto-aim if available
        const autoAim = useGameStore.getState().autoAimTarget
        const shootDirection = autoAim?.direction?.clone() || forward
        
        // Calculate wing positions
        const leftWingWorld = WING_LEFT.clone().applyQuaternion(shipQuat).add(shipPos)
        const rightWingWorld = WING_RIGHT.clone().applyQuaternion(shipQuat).add(shipPos)
        
        // Fire from both wings
        const { addLaser } = useGameStore.getState()
        addLaser({
            startPosition: [leftWingWorld.x, leftWingWorld.y, leftWingWorld.z],
            direction: shootDirection.clone(),
            owner: 'player'
        })
        addLaser({
            startPosition: [rightWingWorld.x, rightWingWorld.y, rightWingWorld.z],
            direction: shootDirection.clone(),
            owner: 'player'
        })
    }, [groupRef])
    
    // Keyboard event handlers
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
            if (e.code === 'Space') {
                e.preventDefault()
                fireLasers()
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
    }, [setBoosting, fireLasers])
    
    return { keysRef }
}
