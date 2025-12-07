import { create } from 'zustand'

/**
 * Debug Store for real-time effect and material adjustments
 * Controls both post-processing bloom AND material emission
 * Press 'D' to toggle debug panel visibility
 */
export const useDebugStore = create((set) => ({
    // === BLOOM POST-PROCESSING ===
    bloomThreshold: 0.42,
    bloomStrength: 0.3,
    bloomRadius: 0.1,
    
    // === TONE MAPPING ===
    exposure: 0.4,
    // 0 = None, 1 = Linear, 2 = Reinhard, 3 = Cineon, 4 = ACESFilmic, 5 = AgX, 6 = Neutral
    tonemapping: 0, // Default: None
    
    // === MATERIAL EMISSIVE INTENSITY ===
    // multiplyScalar values for meshBasicMaterial colors
    sunEmissive: 8.5,        // Sun core brightness
    planetEmissive: 5.5,     // Planet base brightness
    planetHoverEmissive: 7,  // Planet hover brightness
    moonEmissive: 2,         // Moon brightness
    satelliteEmissive: 2,    // Satellite icon glow
    
    // Debug panel visibility (hidden by default, press D to toggle)
    showDebugPanel: false,
    
    // === BLOOM ACTIONS ===
    setBloomThreshold: (value) => set({ bloomThreshold: value }),
    setBloomStrength: (value) => set({ bloomStrength: value }),
    setBloomRadius: (value) => set({ bloomRadius: value }),
    setExposure: (value) => set({ exposure: value }),
    setTonemapping: (value) => set({ tonemapping: value }),
    
    // === EMISSIVE ACTIONS ===
    setSunEmissive: (value) => set({ sunEmissive: value }),
    setPlanetEmissive: (value) => set({ planetEmissive: value }),
    setPlanetHoverEmissive: (value) => set({ planetHoverEmissive: value }),
    setMoonEmissive: (value) => set({ moonEmissive: value }),
    setSatelliteEmissive: (value) => set({ satelliteEmissive: value }),
    
    toggleDebugPanel: () => set((state) => ({ showDebugPanel: !state.showDebugPanel })),
}))
