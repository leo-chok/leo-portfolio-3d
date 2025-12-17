// Main barrel export for 3D components
// Organized by category for clean imports

// Scene components (Solar system, celestial bodies, environment)
export { 
    SolarSystem, 
    CelestialBody, 
    OrbitingBody, 
    OrbitRing,
    Sun, 
    Satellite, 
    MilkyWay, 
    SpaceDust 
} from './scene'

// Ships (Player spaceship, NPC ships, effects)
export { 
    SpaceshipController, 
    Mothership, 
    ShipDust, 
    EngineGlow, 
    BarrierEffect 
} from './ships'

// 3D HUD elements (Reticles, callouts in 3D space)
export { 
    HudReticle, 
    HudCallout 
} from './hud3d'

// Custom materials and shaders
export { 
    FresnelGlowMaterial, 
    GlowHalo 
} from './materials'

// Nebula (cosmic background clouds)
export { 
    Nebula, 
    NebulaCloud 
} from './nebula'
