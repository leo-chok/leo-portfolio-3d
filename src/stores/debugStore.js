import { create } from 'zustand'
import { DEFAULTS } from '../config/galaxyConfig'

/**
 * Debug Store - Real-time celestial body customization
 * 
 * Controls for each body:
 * - HUE (0-360)
 * - Size (0.5-10)
 * - Orbit Radius (5-80)
 * - Orbit Tilt (0-90)
 * 
 * Press 'D' to toggle debug panel
 */
export const useDebugStore = create((set, get) => ({
    // === Debug panel visibility ===
    showDebugPanel: false,
    toggleDebugPanel: () => set((state) => ({ showDebugPanel: !state.showDebugPanel })),
    
    // === PARTICLE COUNTS ===
    starsCount: 2000,
    dustCount: 1500,
    setStarsCount: (value) => set({ starsCount: value }),
    setDustCount: (value) => set({ dustCount: value }),
    
    // === SUN ===
    sun: { ...DEFAULTS.sun },
    setSun: (key, value) => set((state) => ({ 
        sun: { ...state.sun, [key]: value } 
    })),
    
    // === PLANETS ===
    planets: { ...DEFAULTS.planets },
    setPlanet: (planetId, key, value) => set((state) => ({
        planets: {
            ...state.planets,
            [planetId]: { ...state.planets[planetId], [key]: value }
        }
    })),
    
    // === MOONS ===
    moons: { ...DEFAULTS.moons },
    setMoon: (moonId, key, value) => set((state) => ({
        moons: {
            ...state.moons,
            [moonId]: { ...state.moons[moonId], [key]: value }
        }
    })),
    
    // === GETTERS ===
    getSunValue: (key) => get().sun[key],
    getPlanetValue: (planetId, key) => get().planets[planetId]?.[key],
    getMoonValue: (moonId, key) => get().moons[moonId]?.[key],
    
    // === RESET ===
    resetAll: () => set({
        sun: { ...DEFAULTS.sun },
        planets: { ...DEFAULTS.planets },
        moons: { ...DEFAULTS.moons },
    }),
}))

/**
 * Helper function to convert HUE to HSL color string
 */
export const hueToColor = (hue, saturation = 70, lightness = 60) => {
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
