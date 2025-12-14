import { useWindowStore } from '../../stores/windowStore'
import { HoloWindow } from './common/HoloWindow'

// View components
import { PresentationView } from './views/PresentationView'
import { PortfolioView } from './views/PortfolioView'
import { FormationView } from './views/FormationView'
import { SkillsView } from './views/SkillsView'
import { ContactView } from './views/ContactView'
import { ProjectDetailView } from './views/ProjectDetailView'

/**
 * WindowManager - Renders all open windows from windowStore
 * 
 * Features:
 * - Multiple windows simultaneously
 * - Z-index management (click = front)
 * - Minimize/restore
 * - Position persistence
 * - Project detail windows (from moons/portfolio)
 */

// Map section IDs to their view components
const SECTION_VIEWS = {
    presentation: PresentationView,
    portfolio: PortfolioView,
    formation: FormationView,
    skills: SkillsView,
    contact: ContactView,
}

export const WindowManager = () => {
    const windows = useWindowStore((state) => state.windows)
    const closeWindow = useWindowStore((state) => state.closeWindow)
    const minimizeWindow = useWindowStore((state) => state.minimizeWindow)
    const restoreWindow = useWindowStore((state) => state.restoreWindow)
    const bringToFront = useWindowStore((state) => state.bringToFront)
    const updatePosition = useWindowStore((state) => state.updatePosition)
    const openProjectWindow = useWindowStore((state) => state.openProjectWindow)
    
    if (windows.length === 0) return null
    
    return (
        <>
            {windows.map((window) => {
                // Handle project detail windows
                if (window.type === 'project' && window.projectData) {
                    return (
                        <HoloWindow
                            key={window.id}
                            title={window.title}
                            subtitle={window.subtitle}
                            initialPosition={window.position}
                            isMinimized={window.isMinimized}
                            zIndex={window.zIndex}
                            onClose={() => closeWindow(window.id)}
                            onMinimize={() => minimizeWindow(window.id)}
                            onRestore={() => restoreWindow(window.id)}
                            onFocus={() => bringToFront(window.id)}
                        >
                            <ProjectDetailView 
                                project={window.projectData} 
                                onBack={() => closeWindow(window.id)} 
                            />
                        </HoloWindow>
                    )
                }
                
                // Handle standard section windows
                const ViewComponent = SECTION_VIEWS[window.sectionId]
                
                if (!ViewComponent) {
                    console.warn(`No view component for section: ${window.sectionId}`)
                    return null
                }
                
                // Portfolio needs special handling for project selection
                const viewProps = window.sectionId === 'portfolio' 
                    ? { onProjectSelect: openProjectWindow }
                    : {}
                
                return (
                    <HoloWindow
                        key={window.id}
                        title={window.title}
                        subtitle={window.subtitle}
                        initialPosition={window.position}
                        isMinimized={window.isMinimized}
                        zIndex={window.zIndex}
                        onClose={() => closeWindow(window.id)}
                        onMinimize={() => minimizeWindow(window.id)}
                        onRestore={() => restoreWindow(window.id)}
                        onFocus={() => bringToFront(window.id)}
                    >
                        <ViewComponent {...viewProps} />
                    </HoloWindow>
                )
            })}
        </>
    )
}
