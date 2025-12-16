import { useMemo } from 'react'
import { DraggableWrapper } from './DraggableWrapper'
import './HoloWindow.css'

/**
 * HoloWindow - Generic Sci-Fi Window Frame
 * Supports minimize/restore/maximize functionality
 * 
 * @param {Object} props
 * @param {string} props.title - Window Title
 * @param {string} props.subtitle - Window Subtitle
 * @param {React.ReactNode} props.children - Window Content
 * @param {Object} props.initialPosition - {x, y}
 * @param {Object} props.position - Controlled position {x, y}
 * @param {boolean} props.isMinimized - Whether window is minimized
 * @param {boolean} props.isMaximized - Whether window is maximized
 * @param {number} props.zIndex - Window z-index for stacking
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onMinimize - Minimize callback
 * @param {Function} props.onRestore - Restore callback (click on minimized header)
 * @param {Function} props.onMaximize - Maximize/unmaximize toggle callback
 * @param {Function} props.onFocus - Bring to front callback
 */
export const HoloWindow = ({ 
    title, 
    subtitle, 
    children, 
    initialPosition,
    position,
    isMinimized = false,
    isMaximized = false,
    zIndex = 1,
    onClose,
    onMinimize,
    onRestore,
    onMaximize,
    onFocus,
}) => {
    // Calculate initial width as 50% of viewport (in pixels) - computed once on mount
    const initialWidth = useMemo(() => Math.floor(window.innerWidth * 0.5), [])

    const handleRestoreClick = (e) => {
        e.stopPropagation()
        if (onRestore) onRestore()
    }

    const handleMinimizeClick = (e) => {
        e.stopPropagation()
        if (onMinimize) onMinimize()
    }

    const handleMaximizeClick = (e) => {
        e.stopPropagation()
        if (onMaximize) onMaximize()
    }

    const handleCloseClick = (e) => {
        e.stopPropagation()
        if (onClose) onClose()
    }

    // Build class names
    const windowClasses = [
        'holo-window',
        isMinimized && 'holo-window--minimized',
        isMaximized && 'holo-window--maximized',
    ].filter(Boolean).join(' ')

    const wrapperClasses = [
        'holo-window-wrapper',
        isMinimized && 'holo-window-wrapper--minimized',
        isMaximized && 'holo-window-wrapper--maximized',
    ].filter(Boolean).join(' ')

    return (
        <DraggableWrapper 
            handleSelector=".holo-window__header"
            initialPosition={initialPosition}
            position={position}
            className={wrapperClasses}
            style={{ zIndex }}
            enabled={!isMaximized}
        >
            <div 
                className={windowClasses}
                style={{ width: isMaximized ? undefined : initialWidth }}
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
                        {/* Maximize button - only when not minimized */}
                        {onMaximize && !isMinimized && (
                            <button 
                                className="holo-window__maximize" 
                                onClick={handleMaximizeClick}
                                title={isMaximized ? "Restore" : "Maximize"}
                            >
                                <span className={`holo-window__maximize-icon ${isMaximized ? 'holo-window__maximize-icon--restore' : ''}`} />
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
