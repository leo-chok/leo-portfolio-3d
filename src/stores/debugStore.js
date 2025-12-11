import { create } from 'zustand'

/**
 * Debug Store for real-time effect and material adjustments
 * Controls bloom, materials, AND particle counts
 * Press 'D' to toggle debug panel visibility
 */
export const useDebugStore = create((set) => ({
    // === BLOOM POST-PROCESSING ===
    bloomThreshold: 0.50,
    bloomStrength: 2.20,
    bloomRadius: 0.55,
    bloomEnabled: true,
    
    // === MATERIAL EMISSIVE INTENSITY ===
    sunEmissive: 6.0,
    planetEmissive: 4.5,
    planetHoverEmissive: 6,
    moonEmissive: 3.0,
    satelliteEmissive: 2,
    
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
    
    // === EMISSIVE ACTIONS ===
    setSunEmissive: (value) => set({ sunEmissive: value }),
    setPlanetEmissive: (value) => set({ planetEmissive: value }),
    setPlanetHoverEmissive: (value) => set({ planetHoverEmissive: value }),
    setMoonEmissive: (value) => set({ moonEmissive: value }),
    setSatelliteEmissive: (value) => set({ satelliteEmissive: value }),
    
    // === PARTICLE ACTIONS ===
    setStarsCount: (value) => set({ starsCount: value }),
    setDustCount: (value) => set({ dustCount: value }),
    
    toggleDebugPanel: () => set((state) => ({ showDebugPanel: !state.showDebugPanel })),
}))
