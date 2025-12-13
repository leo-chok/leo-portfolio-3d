import { create } from 'zustand'
import { GALAXY_MAP } from '../config/galaxyConfig'

/**
 * Window Store - Manages HUD window state
 * 
 * Features:
 * - Multiple windows open simultaneously
 * - No duplicate sections (1 window per sectionId)
 * - Minimize/restore windows
 * - Z-index management (bring to front)
 * - Position persistence
 */

// Window metadata by section ID
const SECTION_CONFIG = {
    presentation: { title: 'PRÉSENTATION', subtitle: 'MISSION OVERVIEW' },
    portfolio: { title: 'PORTFOLIO', subtitle: 'PROJECTS DB' },
    formation: { title: 'FORMATION', subtitle: 'EXPERIENCE LOG' },
    skills: { title: 'COMPÉTENCES', subtitle: 'SKILLS DATABASE' },
    contact: { title: 'CONTACT', subtitle: 'COMMUNICATION LINK' },
}

// Get moon count for a section (for loading time calculation)
const getMoonCount = (sectionId) => {
    const planet = GALAXY_MAP.planets.find(p => p.id === sectionId)
    return planet?.moons?.length || 0
}

// Generate unique window ID
let windowIdCounter = 0
const generateWindowId = () => `win-${++windowIdCounter}-${Date.now()}`

export const useWindowStore = create((set, get) => ({
    // Array of open windows
    windows: [],
    
    // Highest z-index
    topZIndex: 1,
    
    // Currently loading section (for loading bar)
    loadingSection: null,
    loadingProgress: 0,
    
    /**
     * Open a window for a section
     * - Checks for duplicates (brings existing to front instead)
     * - Returns true if new window opened, false if duplicate
     */
    openWindow: (sectionId) => {
        const { windows, bringToFront } = get()
        
        // Check if already open
        const existing = windows.find(w => w.sectionId === sectionId)
        if (existing) {
            bringToFront(existing.id)
            return false
        }
        
        // Get config
        const config = SECTION_CONFIG[sectionId]
        if (!config) return false
        
        // Create new window
        const newWindow = {
            id: generateWindowId(),
            sectionId,
            title: config.title,
            subtitle: config.subtitle,
            isMinimized: false,
            position: { x: 50, y: 100 + windows.length * 30 }, // Cascade effect
            zIndex: get().topZIndex + 1,
        }
        
        set((state) => ({
            windows: [...state.windows, newWindow],
            topZIndex: state.topZIndex + 1,
            loadingSection: null,
            loadingProgress: 0,
        }))
        
        return true
    },
    
    /**
     * Close a window by ID
     */
    closeWindow: (windowId) => {
        set((state) => ({
            windows: state.windows.filter(w => w.id !== windowId)
        }))
    },
    
    /**
     * Minimize a window (show only header)
     */
    minimizeWindow: (windowId) => {
        set((state) => ({
            windows: state.windows.map(w => 
                w.id === windowId ? { ...w, isMinimized: true } : w
            )
        }))
    },
    
    /**
     * Restore a minimized window
     */
    restoreWindow: (windowId) => {
        const { bringToFront } = get()
        set((state) => ({
            windows: state.windows.map(w => 
                w.id === windowId ? { ...w, isMinimized: false } : w
            )
        }))
        bringToFront(windowId)
    },
    
    /**
     * Bring window to front (highest z-index)
     */
    bringToFront: (windowId) => {
        set((state) => ({
            windows: state.windows.map(w => 
                w.id === windowId ? { ...w, zIndex: state.topZIndex + 1 } : w
            ),
            topZIndex: state.topZIndex + 1,
        }))
    },
    
    /**
     * Update window position (after drag)
     */
    updatePosition: (windowId, position) => {
        set((state) => ({
            windows: state.windows.map(w => 
                w.id === windowId ? { ...w, position } : w
            )
        }))
    },
    
    /**
     * Start loading animation for a section
     * Duration: 300ms base + 100ms per moon
     */
    startLoading: (sectionId) => {
        const moonCount = getMoonCount(sectionId)
        const duration = 300 + moonCount * 100
        
        set({ loadingSection: sectionId, loadingProgress: 0 })
        
        // Animate progress
        const startTime = Date.now()
        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            
            if (progress < 1) {
                set({ loadingProgress: progress })
                requestAnimationFrame(animate)
            } else {
                // Loading complete - open window
                get().openWindow(sectionId)
            }
        }
        requestAnimationFrame(animate)
    },
    
    /**
     * Check if a section is already open
     */
    isOpen: (sectionId) => {
        return get().windows.some(w => w.sectionId === sectionId)
    },
    
    /**
     * Get window by section ID
     */
    getWindowBySection: (sectionId) => {
        return get().windows.find(w => w.sectionId === sectionId)
    },
}))
