/**
 * Enemy Ship Configuration
 * 
 * AI behavior, movement speeds, and attack settings.
 */

export const ENEMY_CONFIG = {
    // Movement speeds
    approachSpeed: 8,
    loopSpeed: 10,
    passThroughSpeed: 12,
    realignSpeed: 10,
    
    // Attack settings
    shotCooldownAligned: 0.5,   // Fire rate when aligned with player
    shotCooldownNormal: 1.5,    // Fire rate when not aligned
    alignmentThreshold: 0.92,   // cos(~22°) - angle to consider "aligned"
    
    // Pass-through phase
    passThroughMin: 2,          // Minimum seconds
    passThroughMax: 5,          // Maximum seconds
    
    // Loop maneuver
    loopRadius: 30,
    
    // Direction smoothing
    directionLerpSpeed: 1.0,    // Lower = smoother transitions
    
    // Roll (banking)
    maxRoll: Math.PI / 3,       // 60° max bank angle
    rollLerpSpeed: 3.0,
    
    // Visual
    modelScale: 0.15,
    engineGlowPosition: [0, 0.25, 1],
    engineGlowSize: 0.4,
}
