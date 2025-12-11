import { create } from 'zustand'

/**
 * Debug Store for real-time effect and material adjustments
 * Controls bloom, HUE colors, AND particle counts
 * Press 'D' to toggle debug panel visibility
 */
export const useDebugStore = create((set) => ({
    // === BLOOM POST-PROCESSING ===
    bloomThreshold: 0.50,
    bloomStrength: 2.20,
    bloomRadius: 0.55,
    bloomEnabled: false,
    
    // === MATERIAL EMISSIVE INTENSITY (all set to 1 for Fresnel) ===
    sunEmissive: 1.0,
    planetEmissive: 1.0,
    planetHoverEmissive: 1.3,
    moonEmissive: 1.0,
    satelliteEmissive: 1.0,
    
    // === HUE COLORS (0-360 degree color wheel) ===
    sunHue: 40,         // Orange/yellow
    planetHue1: 200,    // Blue (Portfolio)
    planetHue2: 280,    // Purple (Contact)
    moonHue: 180,       // Cyan (all moons share this)
    
    // === PARTICLE COUNTS (performance tuning) ===
    starsCount: 2000,
    dustCount: 1500,
    
    // Debug panel visibility
    showDebugPanel: false,
    
    // === BLOOM ACTIONS ===
    setBloomThreshold: (value) => set({ bloomThreshold: value }),
    setBloomStrength: (value) => set({ bloomStrength: value }),
    setBloomRadius: (value) => set({ bloomRadius: value }),
    toggleBloomEnabled: () => set((state) => ({ bloomEnabled: !state.bloomEnabled })),
    
    // === HUE ACTIONS ===
    setSunHue: (value) => set({ sunHue: value }),
    setPlanetHue1: (value) => set({ planetHue1: value }),
    setPlanetHue2: (value) => set({ planetHue2: value }),
    setMoonHue: (value) => set({ moonHue: value }),
    
    // === PARTICLE ACTIONS ===
    setStarsCount: (value) => set({ starsCount: value }),
    setDustCount: (value) => set({ dustCount: value }),
    
    toggleDebugPanel: () => set((state) => ({ showDebugPanel: !state.showDebugPanel })),
}))

/**
 * Helper function to convert HUE to HSL color string
 */
export const hueToColor = (hue, saturation = 70, lightness = 60) => {
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
