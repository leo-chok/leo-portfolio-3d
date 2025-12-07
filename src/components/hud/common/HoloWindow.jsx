import { DraggableWrapper } from './DraggableWrapper'
import './HoloWindow.css'

/**
 * HoloWindow - Generic Sci-Fi Window Frame
 * @param {Object} props
 * @param {string} props.title - Window Title
 * @param {string} props.subtitle - Window Subtitle
 * @param {React.ReactNode} props.children - Window Content
 * @param {Object} props.initialPosition - {x, y}
 * @param {Function} props.onClose - Optional close callback
 */
export const HoloWindow = ({ 
    title, 
    subtitle, 
    children, 
    initialPosition,
    position, // New prop
    onClose 
}) => {
    return (
        <DraggableWrapper 
            handleSelector=".holo-window__header" // Drag by header
            initialPosition={initialPosition}
            position={position}
            className="holo-window-wrapper"
        >
            <div className="holo-window">
                <div className="holo-window__scanlines" />
                
                {/* Corner brackets */}
                <div className="holo-window__bracket holo-window__bracket--tl" />
                <div className="holo-window__bracket holo-window__bracket--tr" />
                <div className="holo-window__bracket holo-window__bracket--bl" />
                <div className="holo-window__bracket holo-window__bracket--br" />
                
                {/* Header (Drag Handle) */}
                <div className="holo-window__header">
                    <div className="holo-window__header-grip">
                        <span className="holo-window__grip-dots">⠿</span>
                    </div>
                    <div className="holo-window__header-content">
                        <div className="holo-window__title">{title}</div>
                        {subtitle && <div className="holo-window__subtitle">{subtitle}</div>}
                    </div>
                    <div className="holo-window__header-actions">
                        {onClose && (
                            <button className="holo-window__close" onClick={onClose}>×</button>
                        )}
                    </div>
                </div>
                
                {/* Content Area */}
                <div className="holo-window__content">
                    {children}
                </div>
                
                {/* Footer */}
                <div className="holo-window__footer">
                   <div className="holo-window__footer-line" />
                   <span className="holo-window__footer-status">SYSTEM ACTIVE</span>
                </div>
            </div>
        </DraggableWrapper>
    )
}
