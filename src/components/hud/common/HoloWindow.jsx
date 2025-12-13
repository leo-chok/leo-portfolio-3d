import { DraggableWrapper } from './DraggableWrapper'
import './HoloWindow.css'

/**
 * HoloWindow - Generic Sci-Fi Window Frame
 * Supports minimize/restore functionality
 * 
 * @param {Object} props
 * @param {string} props.title - Window Title
 * @param {string} props.subtitle - Window Subtitle
 * @param {React.ReactNode} props.children - Window Content
 * @param {Object} props.initialPosition - {x, y}
 * @param {Object} props.position - Controlled position {x, y}
 * @param {boolean} props.isMinimized - Whether window is minimized
 * @param {number} props.zIndex - Window z-index for stacking
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onMinimize - Minimize callback
 * @param {Function} props.onRestore - Restore callback (click on minimized header)
 * @param {Function} props.onFocus - Bring to front callback
 */
export const HoloWindow = ({ 
    title, 
    subtitle, 
    children, 
    initialPosition,
    position,
    isMinimized = false,
    zIndex = 1,
    onClose,
    onMinimize,
    onRestore,
    onFocus,
}) => {
    const handleRestoreClick = (e) => {
        e.stopPropagation()
        if (onRestore) onRestore()
    }

    const handleMinimizeClick = (e) => {
        e.stopPropagation()
        if (onMinimize) onMinimize()
    }

    const handleCloseClick = (e) => {
        e.stopPropagation()
        if (onClose) onClose()
    }

    return (
        <DraggableWrapper 
            handleSelector=".holo-window__header"
            initialPosition={initialPosition}
            position={position}
            className={`holo-window-wrapper ${isMinimized ? 'holo-window-wrapper--minimized' : ''}`}
            style={{ zIndex }}
        >
            <div 
                className={`holo-window ${isMinimized ? 'holo-window--minimized' : ''}`}
                onMouseDown={onFocus}
            >
                {!isMinimized && <div className="holo-window__scanlines" />}
                
                {/* Corner brackets - hide when minimized */}
                {!isMinimized && (
                    <>
                        <div className="holo-window__bracket holo-window__bracket--tl" />
                        <div className="holo-window__bracket holo-window__bracket--tr" />
                        <div className="holo-window__bracket holo-window__bracket--bl" />
                        <div className="holo-window__bracket holo-window__bracket--br" />
                    </>
                )}
                
                {/* Header (Drag Handle only) */}
                <div className="holo-window__header">
                    <div className="holo-window__header-grip">
                        <span className="holo-window__grip-dots">⠿</span>
                    </div>
                    <div className="holo-window__header-content">
                        <div className="holo-window__title">{title}</div>
                        {subtitle && !isMinimized && (
                            <div className="holo-window__subtitle">{subtitle}</div>
                        )}
                    </div>
                    <div className="holo-window__header-actions">
                        {/* Minimize button - only when not minimized */}
                        {onMinimize && !isMinimized && (
                            <button 
                                className="holo-window__minimize" 
                                onClick={handleMinimizeClick}
                                title="Minimize"
                            >
                                −
                            </button>
                        )}
                        {/* Restore button - only when minimized */}
                        {isMinimized && onRestore && (
                            <button 
                                className="holo-window__restore" 
                                onClick={handleRestoreClick}
                                title="Restore"
                            >
                                <span className="holo-window__restore-icon" />
                            </button>
                        )}
                        {onClose && (
                            <button 
                                className="holo-window__close" 
                                onClick={handleCloseClick}
                                title="Close"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Content Area - Hidden when minimized */}
                {!isMinimized && (
                    <div className="holo-window__content">
                        {children}
                    </div>
                )}
                
                {/* Footer - Hidden when minimized */}
                {!isMinimized && (
                    <div className="holo-window__footer">
                       <div className="holo-window__footer-line" />
                       <span className="holo-window__footer-status">SYSTEM ACTIVE</span>
                    </div>
                )}
            </div>
        </DraggableWrapper>
    )
}
