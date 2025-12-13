import { useWindowStore } from '../../stores/windowStore'
import { HoloWindow } from './common/HoloWindow'

// View components
import { PresentationView } from './views/PresentationView'
import { PortfolioView } from './views/PortfolioView'
import { FormationView } from './views/FormationView'
import { SkillsView } from './views/SkillsView'
import { ContactView } from './views/ContactView'

/**
 * WindowManager - Renders all open windows from windowStore
 * 
 * Features:
 * - Multiple windows simultaneously
 * - Z-index management (click = front)
 * - Minimize/restore
 * - Position persistence
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
    
    if (windows.length === 0) return null
    
    return (
        <>
            {windows.map((window) => {
                const ViewComponent = SECTION_VIEWS[window.sectionId]
                
                if (!ViewComponent) {
                    console.warn(`No view component for section: ${window.sectionId}`)
                    return null
                }
                
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
                        <ViewComponent />
                    </HoloWindow>
                )
            })}
        </>
    )
}
