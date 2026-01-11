import { create } from 'zustand'

/**
 * Asteroid Store - Manages asteroid belt data for collision detection
 * Uses hybrid approach: zone check first, then nearby asteroid check
 */
export const useAsteroidStore = create((set, get) => ({
    // Belt configuration
    innerRadius: 98,
    outerRadius: 105,
    thickness: 2,
    
    // Asteroid data array (set by AsteroidBelt component)
    asteroids: [],
    
    // Register asteroid data from AsteroidBelt component
    setAsteroids: (asteroidData) => set({ asteroids: asteroidData }),
    
    // Update belt config
    setBeltConfig: (inner, outer, thickness) => set({
        innerRadius: inner,
        outerRadius: outer,
        thickness: thickness
    }),
    
    /**
     * Check if a position is inside the asteroid belt zone
     * Fast cylinder check - O(1)
     */
    isInBeltZone: (position) => {
        const { innerRadius, outerRadius, thickness } = get()
        
        // Horizontal distance from center (XZ plane)
        const horizontalDist = Math.sqrt(position.x * position.x + position.z * position.z)
        
        // Check if within radius range
        if (horizontalDist < innerRadius || horizontalDist > outerRadius) {
            return false
        }
        
        // Check if within vertical thickness
        if (Math.abs(position.y) > thickness) {
            return false
        }
        
        return true
    },
    
    /**
     * Find nearby asteroids within a given radius
     * Only call this if isInBeltZone returns true
     * Returns array of { position, collisionRadius }
     */
    getNearbyAsteroids: (position, searchRadius = 5) => {
        const { asteroids } = get()
        const nearby = []
        
        const searchRadiusSq = searchRadius * searchRadius
        
        for (const asteroid of asteroids) {
            const dx = position.x - asteroid.position.x
            const dy = position.y - asteroid.position.y
            const dz = position.z - asteroid.position.z
            const distSq = dx * dx + dy * dy + dz * dz
            
            if (distSq < searchRadiusSq) {
                nearby.push({
                    position: asteroid.position,
                    collisionRadius: asteroid.collisionRadius
                })
            }
        }
        
        return nearby
    },
    
    /**
     * Quick collision check - hybrid approach
     * Returns true if collision with asteroid
     */
    checkCollision: (position, objectRadius = 0.5) => {
        const { isInBeltZone, getNearbyAsteroids } = get()
        
        // Phase 1: Fast zone check
        if (!isInBeltZone(position)) {
            return false
        }
        
        // Phase 2: Check nearby asteroids
        const nearby = getNearbyAsteroids(position, 5)
        
        for (const asteroid of nearby) {
            const dx = position.x - asteroid.position.x
            const dy = position.y - asteroid.position.y
            const dz = position.z - asteroid.position.z
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
            
            const totalRadius = asteroid.collisionRadius + objectRadius
            
            if (distance < totalRadius) {
                return true
            }
        }
        
        return false
    }
}))
