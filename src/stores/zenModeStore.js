import { create } from 'zustand'
import * as THREE from 'three'

/**
 * Zen Mode Store
 * 
 * Manages the contemplative "screensaver" mode:
 * - Random camera positions around the scene
 * - Fade transitions between viewpoints
 * - Auto-rotation with subtle drift
 */
export const useZenModeStore = create((set, get) => ({
    // Core state
    isZenMode: false,
    fadeState: 'visible', // 'visible' | 'fading-out' | 'fading-in'
    fadeOpacity: 0, // 0 = transparent, 1 = black
    
    // Camera state
    currentViewIndex: 0,
    cameraPosition: new THREE.Vector3(80, 30, 80),
    lookAtTarget: new THREE.Vector3(0, 0, 0), // Sun at origin
    
    // Timing
    viewDuration: 45, // Will be randomized 30-90s
    transitionDuration: 1.5, // Fade duration in seconds
    
    // View presets (will be picked randomly)
    // lookAt can be: [x,y,z] coordinates, 'sun', 'mothership', or planet ID string
    viewPresets: [
        // === WIDE OVERVIEW SHOTS (sun-focused, far away) ===
        { position: [180, 80, 180], lookAt: [0, 0, 0], weight: 1 },
        { position: [-200, 60, 150], lookAt: [0, 0, 0], weight: 1 },
        { position: [150, 120, -180], lookAt: [0, 0, 0], weight: 1 },
        { position: [-160, 40, -200], lookAt: [0, 0, 0], weight: 1 },
        { position: [220, 30, 80], lookAt: [0, 0, 0], weight: 1 },
        { position: [80, 180, 80], lookAt: [0, 0, 0], weight: 0.8 }, // Top-down
        { position: [-120, 25, 200], lookAt: [0, 0, 0], weight: 1 },
        { position: [250, 50, -100], lookAt: [0, 0, 0], weight: 0.8 },
        
        // === PLANET TRACKING (camera follows planet, offset view) ===
        { position: [40, 15, 30], lookAt: 'JS', weight: 0.7, type: 'planet' },
        { position: [-30, 20, 40], lookAt: 'Python', weight: 0.7, type: 'planet' },
        { position: [35, 25, -35], lookAt: 'Next.js', weight: 0.7, type: 'planet' },
        { position: [-40, 10, -30], lookAt: 'React', weight: 0.7, type: 'planet' },
        { position: [50, 30, 20], lookAt: 'Node.js', weight: 0.5, type: 'planet' },
        
        // === MOTHERSHIP TRACKING ===
        { position: [25, 20, 60], lookAt: 'mothership', weight: 0.5, type: 'mothership' },
        { position: [-40, 15, 50], lookAt: 'mothership', weight: 0.5, type: 'mothership' },
    ],
    
    // Actions
    enterZenMode: () => {
        const { pickRandomView } = get()
        pickRandomView()
        set({ 
            isZenMode: true, 
            fadeState: 'visible',
            fadeOpacity: 0
        })
    },
    
    exitZenMode: () => {
        set({ 
            isZenMode: false,
            fadeState: 'visible',
            fadeOpacity: 0
        })
    },
    
    // Pick a random view based on weights
    pickRandomView: () => {
        const { viewPresets, currentViewIndex } = get()
        
        // Calculate total weight
        const totalWeight = viewPresets.reduce((sum, v) => sum + v.weight, 0)
        let random = Math.random() * totalWeight
        
        let newIndex = 0
        for (let i = 0; i < viewPresets.length; i++) {
            random -= viewPresets[i].weight
            if (random <= 0) {
                newIndex = i
                break
            }
        }
        
        // Avoid same view twice in a row
        if (newIndex === currentViewIndex && viewPresets.length > 1) {
            newIndex = (newIndex + 1) % viewPresets.length
        }
        
        const view = viewPresets[newIndex]
        
        // Random duration 30-90 seconds
        const viewDuration = 30 + Math.random() * 60
        
        set({
            currentViewIndex: newIndex,
            cameraPosition: new THREE.Vector3(...view.position),
            lookAtTarget: Array.isArray(view.lookAt) 
                ? new THREE.Vector3(...view.lookAt) 
                : view.lookAt, // 'mothership' string
            viewDuration
        })
    },
    
    // Start transition to next view
    startTransition: () => {
        set({ fadeState: 'fading-out' })
    },
    
    // Called when fade-out complete
    onFadeOutComplete: () => {
        const { pickRandomView } = get()
        pickRandomView()
        set({ fadeState: 'fading-in' })
    },
    
    // Called when fade-in complete
    onFadeInComplete: () => {
        set({ fadeState: 'visible', fadeOpacity: 0 })
    },
    
    // Update fade opacity
    setFadeOpacity: (opacity) => set({ fadeOpacity: opacity }),
}))
