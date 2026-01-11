/**
 * Player Ship Configuration
 * 
 * Centralized settings for ship controls, physics, and boundaries.
 */

export const PLAYER_CONFIG = {
    // Visual scale
    shipScale: 0.01,
    
    // Speed settings
    maxSpeedKmh: 1117,          // Max speed in km/h (displayed)
    speedToUnits: 0.00604,      // Conversion: 1117 km/h = 6.75 units/s
    throttleRate: 280,          // km/h per second while holding Shift
    brakeRate: 400,             // km/h per second while holding Ctrl
    
    // Rotation (radians per second)
    rotationSpeed: 6.0,
    rotationDamping: 0.92,
    
    // Boundary settings
    boundaryRadius: 200,
    boundarySlowdownStart: 180,
    
    // Store update throttling
    speedThreshold: 1,
    barrierThreshold: 0.05,
    positionThreshold: 0.5,
}
