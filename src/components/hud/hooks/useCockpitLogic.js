import { useCameraStore } from '../../../stores/cameraStore'
import { useWindowStore } from '../../../stores/windowStore'
import { useSpaceshipStore } from '../../../stores/spaceshipStore'
import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { GALAXY_MAP } from '../../../config/galaxyConfig'
import { useDecryptingText } from '../../../utils/textUtils'

// Build navigation list: Overview (00) + sun + planets
const NAV_SECTIONS = [
    { id: 'overview', name: 'OVERVIEW', isOverview: true },
    { id: GALAXY_MAP.sun.id, name: GALAXY_MAP.sun.name },
    ...GALAXY_MAP.planets.map(p => ({ id: p.id, name: p.name }))
]

/**
 * useCockpitLogic - Custom hook that encapsulates all CockpitHUD business logic
 * 
 * Returns all state, computed values, and handlers needed by CockpitHUD
 */
export const useCockpitLogic = () => {
    // Camera store
    const isTracking = useCameraStore((state) => state.isTracking)
    const trackedRef = useCameraStore((state) => state.trackedRef)
    const trackedId = useCameraStore((state) => state.trackedId)
    const trackedProjectData = useCameraStore((state) => state.trackedProjectData)
    const bodyRegistry = useCameraStore((state) => state.bodyRegistry)
    const navigateTo = useCameraStore((state) => state.navigateTo)
    const returnToOverview = useCameraStore((state) => state.returnToOverview)
    
    // Window store
    const startLoading = useWindowStore((state) => state.startLoading)
    const loadingSection = useWindowStore((state) => state.loadingSection)
    const loadingProgress = useWindowStore((state) => state.loadingProgress)
    const windows = useWindowStore((state) => state.windows)
    const analyzedSections = useWindowStore((state) => state.analyzedSections)
    const decryptingSection = useWindowStore((state) => state.decryptingSection)
    const openData = useWindowStore((state) => state.openData)
    const openProjectWindow = useWindowStore((state) => state.openProjectWindow)
    const closeAllWindows = useWindowStore((state) => state.closeAllWindows)
    
    // Spaceship store
    const isSpaceshipMode = useSpaceshipStore(state => state.isSpaceshipMode)
    const enterSpaceshipMode = useSpaceshipStore(state => state.enterSpaceshipMode)
    
    // Local state
    const [activeSection, setActiveSection] = useState('overview')
    const [isVisible, setIsVisible] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [dismissedSuccess, setDismissedSuccess] = useState(false)
    
    const dropdownRef = useRef(null)
    
    // Computed values
    const currentIndex = useMemo(() => {
        return NAV_SECTIONS.findIndex(s => s.id === activeSection)
    }, [activeSection])
    
    const sectionDisplayName = useMemo(() => {
        const section = NAV_SECTIONS.find(s => s.id === activeSection)
        return section?.name || 'OVERVIEW'
    }, [activeSection])
    
    const isCurrentAnalyzed = activeSection === 'overview' || analyzedSections.has(activeSection)
    const isDecrypting = decryptingSection === activeSection
    
    const displayTitle = useDecryptingText(sectionDisplayName, isDecrypting, 500, isCurrentAnalyzed)
    
    const sectionHasWindow = useMemo(() => {
        return windows.some(w => w.sectionId === activeSection)
    }, [windows, activeSection])
    
    // Score tracking
    const totalAnalyzable = NAV_SECTIONS.filter(s => !s.isOverview).length
    const navSectionIds = useMemo(() => NAV_SECTIONS.map(s => s.id), [])
    const analyzedCount = useMemo(() => {
        return [...analyzedSections].filter(id => navSectionIds.includes(id)).length
    }, [analyzedSections, navSectionIds])
    const allDiscovered = analyzedCount >= totalAnalyzable
    
    const showAnalyzeButton = isTracking && trackedId && activeSection !== 'overview'
    const isLoading = loadingSection === trackedId
    
    // Effects
    useEffect(() => {
        if (allDiscovered && !showSuccessModal && !dismissedSuccess) {
            const timer = setTimeout(() => {
                closeAllWindows() // Close all windows before showing modal
                setShowSuccessModal(true)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [allDiscovered, dismissedSuccess, closeAllWindows])
    
    useEffect(() => {
        if (trackedId) {
            setActiveSection(trackedId)
            setIsVisible(true)
        } else if (isTracking && trackedRef) {
            for (const [id, data] of Object.entries(bodyRegistry)) {
                if (data.ref === trackedRef) {
                    setActiveSection(id)
                    setIsVisible(true)
                    return
                }
            }
        } else {
            setActiveSection('overview')
            setIsVisible(true)
        }
    }, [isTracking, trackedRef, trackedId, bodyRegistry])
    
    useEffect(() => {
        setIsVisible(true)
    }, [])
    
    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false)
            }
        }
        
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isDropdownOpen])
    
    // Handlers
    const closeSuccessModal = useCallback(() => {
        setShowSuccessModal(false)
        setDismissedSuccess(true)
        returnToOverview()
    }, [returnToOverview])
    
    const goToSection = useCallback((section) => {
        // Close all windows when navigating (for mobile UX)
        closeAllWindows()
        
        if (section.isOverview) {
            returnToOverview()
            setActiveSection('overview')
        } else {
            navigateTo(section.id)
            setActiveSection(section.id)
        }
    }, [navigateTo, returnToOverview, closeAllWindows])
    
    const navigatePrev = useCallback(() => {
        const newIndex = currentIndex <= 0 ? NAV_SECTIONS.length - 1 : currentIndex - 1
        goToSection(NAV_SECTIONS[newIndex])
    }, [currentIndex, goToSection])
    
    const navigateNext = useCallback(() => {
        const newIndex = currentIndex >= NAV_SECTIONS.length - 1 ? 0 : currentIndex + 1
        goToSection(NAV_SECTIONS[newIndex])
    }, [currentIndex, goToSection])
    
    const handleAnalyze = useCallback(() => {
        if (trackedId && !loadingSection) {
            if (trackedId === 'mothership') {
                if (!analyzedSections.has(trackedId)) {
                    startLoading(trackedId)
                }
                return
            }
            
            if (trackedProjectData) {
                if (!analyzedSections.has(trackedId)) {
                    startLoading(trackedId)
                }
                openProjectWindow(trackedProjectData)
            } else if (!analyzedSections.has(trackedId)) {
                startLoading(trackedId)
            } else if (!sectionHasWindow) {
                openData(trackedId)
            }
        }
    }, [trackedId, trackedProjectData, sectionHasWindow, loadingSection, startLoading, openData, openProjectWindow, analyzedSections])
    
    const toggleDropdown = useCallback(() => {
        setIsDropdownOpen(prev => !prev)
    }, [])
    
    const handleDropdownSelect = useCallback((section) => {
        goToSection(section)
        setIsDropdownOpen(false)
    }, [goToSection])
    
    // Return all needed values
    return {
        // Visibility
        isVisible,
        isSpaceshipMode,
        
        // TopBar props
        displayTitle,
        currentIndex,
        totalSections: NAV_SECTIONS.length,
        isDropdownOpen,
        toggleDropdown,
        navigatePrev,
        navigateNext,
        sections: NAV_SECTIONS,
        activeSection,
        analyzedSections,
        handleDropdownSelect,
        dropdownRef,
        
        // AnalyzeButton props
        showAnalyzeButton,
        isLoading,
        loadingProgress,
        sectionHasWindow,
        trackedId,
        handleAnalyze,
        
        // DiscoveryScore props
        analyzedCount,
        totalAnalyzable,
        allDiscovered,
        enterSpaceshipMode,
        
        // SuccessModal props
        showSuccessModal,
        closeSuccessModal,
    }
}
