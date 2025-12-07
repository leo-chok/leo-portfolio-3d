import { create } from 'zustand'

/**
 * Camera Store - Manages camera tracking state
 * Allows any celestial body to register itself as the current target
 */
export const useCameraStore = create((set, get) => ({
    // Reference to the tracked object's group (for getWorldPosition)
    trackedRef: null,
    
    // ID of currently tracked body (for UI synchronization)
    trackedId: null,
    
    // Is camera currently following something?
    isTracking: false,
    
    // Size of tracked object (for offset calculation)
    targetSize: 1.5,
    
    // Pending navigation target (ID of planet to navigate to)
    pendingNavigationId: null,
    
    // Registry of celestial body refs by ID
    bodyRegistry: {},
    
    // Register a celestial body
    registerBody: (id, ref, size) => set((state) => ({
        bodyRegistry: { ...state.bodyRegistry, [id]: { ref, size } }
    })),
    
    // Unregister a celestial body
    unregisterBody: (id) => set((state) => {
        const newRegistry = { ...state.bodyRegistry }
        delete newRegistry[id]
        return { bodyRegistry: newRegistry }
    }),
    
    // Navigate to a specific planet by ID
    navigateTo: (id) => {
        const body = get().bodyRegistry[id]
        if (body) {
            set({ 
                trackedRef: body.ref, 
                trackedId: id,
                isTracking: true, 
                targetSize: body.size, 
                pendingNavigationId: null 
            })
        } else {
            // Planet not yet in registry, set pending
            set({ pendingNavigationId: id })
        }
    },
    
    // Set the tracked reference and size (called from direct clicks)
    setTrackedRef: (ref, size = 1.5, id = null) => set({ 
        trackedRef: ref, 
        trackedId: id,
        isTracking: true, 
        targetSize: size 
    }),
    
    // Stop tracking
    stopTracking: () => set({ trackedRef: null, trackedId: null, isTracking: false }),
    
    // Return to initial overview position
    isReturningToOverview: false,
    returnToOverview: () => set({ 
        trackedRef: null, 
        trackedId: null,
        isTracking: false, 
        isReturningToOverview: true 
    }),
    clearReturningToOverview: () => set({ isReturningToOverview: false }),
    
    // Set tracking offset based on body size
    setTrackingOffset: (size) => set({ 
        trackingOffset: { 
            x: 0, 
            y: size * 3, 
            z: size * 8 
        } 
    }),
}))
