import { useWindowStore } from '../../../stores/windowStore'
import './Taskbar.css'

/**
 * Taskbar - Windows-style taskbar for minimized windows
 * Simple list aligned left, minimal design
 */
export const Taskbar = () => {
    const windows = useWindowStore((state) => state.windows)
    const restoreWindow = useWindowStore((state) => state.restoreWindow)
    const closeWindow = useWindowStore((state) => state.closeWindow)
    
    // Filter only minimized windows
    const minimizedWindows = windows.filter(w => w.isMinimized)
    
    if (minimizedWindows.length === 0) return null
    
    return (
        <div className="taskbar">
            <div className="taskbar__items">
                {minimizedWindows.map((window) => (
                    <div 
                        key={window.id} 
                        className="taskbar__item"
                        onClick={() => restoreWindow(window.id)}
                    >
                        <span className="taskbar__title">{window.title}</span>
                        <button 
                            className="taskbar__close"
                            onClick={(e) => {
                                e.stopPropagation()
                                closeWindow(window.id)
                            }}
                            title="Close"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
