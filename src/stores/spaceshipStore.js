import { create } from 'zustand'
import { useCameraStore } from './cameraStore'

/**
 * Spaceship Store - Manages spaceship flight mode state
 * 
 * Features:
 * - Toggle spaceship control mode
 * - Track speed and boost state
 * - Collision event hooks (prepared for future)
 */
export const useSpaceshipStore = create((set, get) => ({
    // Is the spaceship mode active?
    isSpaceshipMode: false,
    
    // Current speed in m/s
    speed: 0,
    
    // Maximum speed (without boost)
    maxSpeed: 50,
    
    // Boost multiplier
    boostMultiplier: 2,
    
    // Is boost currently active?
    isBoosting: false,
    
    // Spaceship position (for collision detection later)
    position: { x: 0, y: 0, z: 30 },
    
    // Spaceship rotation (quaternion or euler)
    rotation: { x: 0, y: 0, z: 0 },
    
    // Barrier intensity (0 = no barrier, 1 = full barrier)
    barrierIntensity: 0,
    
    /**
     * Enter spaceship mode
     * Spawns ship at a default position
     */
    enterSpaceshipMode: () => {
        set({
            isSpaceshipMode: true,
            speed: 0,
            isBoosting: false,
            position: { x: 0, y: 5, z: 40 }, // Start in front of sun
            rotation: { x: 0, y: Math.PI, z: 0 } // Facing sun
        })
    },
    
    /**
     * Exit spaceship mode
     * Returns to normal camera/HUD with overview position
     */
    exitSpaceshipMode: () => {
        set({
            isSpaceshipMode: false,
            speed: 0,
            isBoosting: false
        })
        // Return camera to overview orbiting position
        useCameraStore.getState().returnToOverview()
    },
    
    /**
     * Update speed (called from SpaceshipController)
     */
    setSpeed: (speed) => set({ speed }),
    
    /**
     * Toggle boost
     */
    setBoosting: (isBoosting) => set({ isBoosting }),
    
    /**
     * Update position (for collision detection)
     */
    updatePosition: (x, y, z) => set({ position: { x, y, z } }),
    
    /**
     * Update barrier intensity
     */
    setBarrierIntensity: (intensity) => set({ barrierIntensity: intensity }),
    
    /**
     * Collision event hook (prepared for future)
     * Will be called when ship enters a celestial body's radius
     */
    onCelestialCollision: null,
    setCollisionHandler: (handler) => set({ onCelestialCollision: handler }),
}))
