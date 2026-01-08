import { create } from 'zustand'
import { useCameraStore } from './cameraStore'
import { useGameStore } from './gameStore'

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
    
    // Spawn counter - increments each time spaceship mode is entered
    // Used to force repositioning next to mothership on each activation
    spawnCount: 0,
    
    // Death state
    isDead: false,
    deathPosition: null, // [x, y, z] for explosion position
    
    // Health system
    health: 100, // 0-100%
    isHit: false, // True briefly when taking damage (for red flash)
    
    /**
     * Enter spaceship mode
     * Spawns ship at a default position
     * Resets waves to wave 1
     */
    enterSpaceshipMode: () => {
        // Reset game state (waves, enemies, score) to start fresh
        useGameStore.getState().clearAll()
        
        set((state) => ({
            isSpaceshipMode: true,
            speed: 0,
            isBoosting: false,
            isDead: false,
            deathPosition: null,
            health: 100, // Full health on spawn
            isHit: false,
            position: { x: 0, y: 8, z: 60 }, // Start further out, away from mothership
            rotation: { x: 0, y: Math.PI, z: 0 }, // Facing sun
            spawnCount: state.spawnCount + 1 // Increment to trigger repositioning
        }))
    },
    
    /**
     * Take damage - Called when hit by enemy laser
     * @param {number} amount - Damage amount (default 10%)
     * @returns {boolean} true if died
     */
    takeDamage: (amount = 10) => {
        const { health, die } = useSpaceshipStore.getState()
        const newHealth = Math.max(0, health - amount)
        
        set({ health: newHealth, isHit: true })
        
        // Clear hit flash after 200ms
        setTimeout(() => {
            useSpaceshipStore.setState({ isHit: false })
        }, 200)
        
        if (newHealth <= 0) {
            const pos = useSpaceshipStore.getState().position
            die([pos.x, pos.y, pos.z])
            return true
        }
        return false
    },
    
    /**
     * Die - Called when ship collides with obstacle
     * @param {Array} position - [x, y, z] position for explosion
     */
    die: (position) => {
        set({
            isDead: true,
            deathPosition: position,
            speed: 0,
            isBoosting: false
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
            isBoosting: false,
            isDead: false,
            deathPosition: null
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
