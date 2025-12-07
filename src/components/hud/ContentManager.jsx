import { useCameraStore } from '../../stores/cameraStore'
import { useState, useEffect } from 'react'
import { HoloWindow } from './common/HoloWindow'
import { PresentationView } from './views/PresentationView'
import { PortfolioView } from './views/PortfolioView'
import { ProjectDetailView } from './views/ProjectDetailView'

/**
 * ContentManager - Orchestrates HUD Windows
 * Decides which window to show based on tracked element
 */
export const ContentManager = () => {
    const trackedId = useCameraStore((state) => state.trackedId)
    const isTracking = useCameraStore((state) => state.isTracking)
    const returnToOverview = useCameraStore((state) => state.returnToOverview)
    
    const [isVisible, setIsVisible] = useState(false)
    const [activeId, setActiveId] = useState(null)
    const [selectedProject, setSelectedProject] = useState(null)
    
    // Position Logic
    const getInitialPosition = () => {
        const width = window.innerWidth
        const isMobile = width < 768
        const windowWidth = isMobile ? width * 0.95 : 600
        
        return {
            x: (width - windowWidth) / 2,
            y: window.innerHeight * 0.15
        }
    }

    const getLeftPosition = () => ({
        x: 50,
        y: window.innerHeight * 0.15
    })

    const getDetailPosition = () => {
        const width = window.innerWidth
        const isMobile = width < 768
        const baseLeft = 50
        const listWidth = 600 // Approx width of list window
        const gap = 20
        
        // On mobile, center it (overlay). On desktop, place to right of list.
        const x = isMobile ? (width * 0.025) : (baseLeft + listWidth + gap)
        
        return {
            x: x, 
            y: window.innerHeight * 0.15
        }
    }
    
    // Handle visibility with delay for camera travel
    useEffect(() => {
        const validSections = ['presentation', 'portfolio', 'skills', 'contact', 'platforms']
        
        if (isTracking && trackedId && validSections.includes(trackedId)) {
            // Close existing first if switching sections
            if (activeId !== trackedId) {
                setIsVisible(false)
                setSelectedProject(null)
            }
            
            const timer = setTimeout(() => {
                setActiveId(trackedId)
                setIsVisible(true)
            }, 1000)
            return () => clearTimeout(timer)
        } else if (!isTracking) {
            setIsVisible(false)
            // Delay clearing to allow fade out
            const timer = setTimeout(() => {
                setActiveId(null)
                setSelectedProject(null)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isTracking, trackedId, activeId])
    
    const handleClose = () => {
        setIsVisible(false)
        setActiveId(null)
        setSelectedProject(null)
        returnToOverview()
    }

    const handleProjectSelect = (project) => {
        setSelectedProject(project)
    }

    const handleDetailClose = () => {
        setSelectedProject(null)
    }
    
    if (!isVisible || !activeId) return null
    
    return (
        <>
            {activeId === 'presentation' && (
                <HoloWindow 
                    title="PRÉSENTATION" 
                    subtitle="MISSION OVERVIEW"
                    initialPosition={getInitialPosition()}
                    onClose={handleClose}
                >
                    <PresentationView />
                </HoloWindow>
            )}
            
            {activeId === 'portfolio' && (
                <>
                    {/* Main Portfolio List - Moves Left if Project Selected */}
                    <HoloWindow 
                        title="PORTFOLIO" 
                        subtitle="PROJECTS DB"
                        initialPosition={getInitialPosition()}
                        position={selectedProject ? getLeftPosition() : undefined}
                        onClose={handleClose}
                    >
                        <PortfolioView onProjectSelect={handleProjectSelect} />
                    </HoloWindow>

                    {/* Detail Window - Appears when Project Selected */}
                    {selectedProject && (
                        <HoloWindow 
                            title="PROJECT DETAIL" 
                            subtitle={selectedProject.title.toUpperCase()}
                            initialPosition={getDetailPosition()}
                            onClose={handleDetailClose}
                        >
                            <ProjectDetailView 
                                project={selectedProject} 
                                onBack={handleDetailClose} 
                            />
                        </HoloWindow>
                    )}
                </>
            )}
        </>
    )
}
