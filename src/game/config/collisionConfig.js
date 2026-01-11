/**
 * Collision Configuration
 * 
 * Hit radii and damage values for all collision types.
 */

export const COLLISION_CONFIG = {
    // Player
    playerHitRadius: 1.0,
    playerDamagePerHit: 10,     // % health lost per enemy laser hit
    
    // Enemies
    enemyHitRadius: 1.5,
    enemyDamagePerHit: 1,       // HP lost per player laser hit
    
    // Body collision multipliers
    bodyCollisionMultiplier: 1.0,
    presentationCollisionMultiplier: 0.7, // Special case for presentation planet
    
    // Explosion scales
    playerDeathExplosionScale: 2.0,
    laserImpactExplosionScale: 0.2,
    enemyCrashExplosionScale: 0.8,
    shipCollisionExplosionScale: 1.0,
}
