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
    
    // Sections that have been analyzed (names revealed permanently)
    analyzedSections: new Set(),
    
    // Currently decrypting section (for animation sync)
    decryptingSection: null,
    
    // Currently selected project (for project detail windows)
    selectedProject: null,
    
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
     * For moons (no SECTION_CONFIG), only marks as analyzed without opening window
     */
    startLoading: (sectionId) => {
        const moonCount = getMoonCount(sectionId)
        const duration = 300 + moonCount * 100
        
        // Start loading AND decryption animation
        set({ 
            loadingSection: sectionId, 
            loadingProgress: 0,
            decryptingSection: sectionId 
        })
        
        // Animate progress
        const startTime = Date.now()
        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            
            if (progress < 1) {
                set({ loadingProgress: progress })
                requestAnimationFrame(animate)
            } else {
                // Loading complete - mark as analyzed
                const { analyzedSections } = get()
                const newAnalyzed = new Set(analyzedSections)
                newAnalyzed.add(sectionId)
                
                set({ 
                    analyzedSections: newAnalyzed,
                    decryptingSection: null,
                    loadingSection: null,
                    loadingProgress: 0
                })
                
                // Only open window for main sections (not moons)
                if (SECTION_CONFIG[sectionId]) {
                    get().openWindow(sectionId)
                }
            }
        }
        requestAnimationFrame(animate)
    },
    
    /**
     * Open existing data (already analyzed section)
     */
    openData: (sectionId) => {
        get().openWindow(sectionId)
    },
    
    /**
     * Open a project detail window (for moons/portfolio cards)
     * Creates a window with type 'project' and stores projectData
     */
    openProjectWindow: (projectData) => {
        if (!projectData) return false
        
        const { windows, bringToFront } = get()
        const projectWindowId = `project-${projectData.id}`
        
        // Check if already open
        const existing = windows.find(w => w.sectionId === projectWindowId)
        if (existing) {
            bringToFront(existing.id)
            return false
        }
        
        // Create new project window
        const newWindow = {
            id: generateWindowId(),
            sectionId: projectWindowId,
            type: 'project',
            title: 'PROJECT DETAIL',
            subtitle: projectData.title.toUpperCase(),
            projectData: projectData,
            isMinimized: false,
            position: { x: 100 + windows.length * 30, y: 120 + windows.length * 30 },
            zIndex: get().topZIndex + 1,
        }
        
        set((state) => ({
            windows: [...state.windows, newWindow],
            topZIndex: state.topZIndex + 1,
            selectedProject: projectData,
        }))
        
        return true
    },
    
    /**
     * Check if a section has been analyzed (permanently)
     */
    isAnalyzed: (sectionId) => {
        return get().analyzedSections.has(sectionId)
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
