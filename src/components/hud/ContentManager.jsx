import { useCameraStore } from '../../stores/cameraStore'
import { useState, useEffect } from 'react'
import { HoloWindow } from './common/HoloWindow'
import { PresentationView } from './views/PresentationView'
import { PortfolioView } from './views/PortfolioView'
import { ProjectDetailView } from './views/ProjectDetailView'
import { FormationView } from './views/FormationView'
import { SkillsView } from './views/SkillsView'
import { ContactView } from './views/ContactView'

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
        const listWidth = 600
        const gap = 20
        
        const x = isMobile ? (width * 0.025) : (baseLeft + listWidth + gap)
        
        return {
            x: x, 
            y: window.innerHeight * 0.15
        }
    }
    
    // Handle visibility with delay for camera travel
    useEffect(() => {
        const validSections = ['presentation', 'portfolio', 'formation', 'skills', 'contact']
        
        if (isTracking && trackedId && validSections.includes(trackedId)) {
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
                    <HoloWindow 
                        title="PORTFOLIO" 
                        subtitle="PROJECTS DB"
                        initialPosition={getInitialPosition()}
                        position={selectedProject ? getLeftPosition() : undefined}
                        onClose={handleClose}
                    >
                        <PortfolioView onProjectSelect={handleProjectSelect} />
                    </HoloWindow>

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
            
            {activeId === 'formation' && (
                <HoloWindow 
                    title="FORMATION" 
                    subtitle="EXPERIENCE LOG"
                    initialPosition={getInitialPosition()}
                    onClose={handleClose}
                >
                    <FormationView />
                </HoloWindow>
            )}
            
            {activeId === 'skills' && (
                <HoloWindow 
                    title="COMPÉTENCES" 
                    subtitle="SKILLS DATABASE"
                    initialPosition={getInitialPosition()}
                    onClose={handleClose}
                >
                    <SkillsView />
                </HoloWindow>
            )}
            
            {activeId === 'contact' && (
                <HoloWindow 
                    title="CONTACT" 
                    subtitle="COMMUNICATION LINK"
                    initialPosition={getInitialPosition()}
                    onClose={handleClose}
                >
                    <ContactView />
                </HoloWindow>
            )}
        </>
    )
}
