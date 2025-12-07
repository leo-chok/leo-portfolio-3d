import { useState, useEffect, useRef } from 'react'

/**
 * DraggableWrapper - Makes any child component draggable
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to make draggable
 * @param {string} props.handleSelector - CSS selector for the drag handle (optional, defaults to whole component)
 * @param {Object} props.initialPosition - {x, y} percentage or pixels
 * @param {boolean} props.enabled - Whether drag is enabled
 * @param {Function} props.onDragStart - Callback
 * @param {Function} props.onDragEnd - Callback
 */
export const DraggableWrapper = ({ 
    children, 
    handleSelector, 
    initialPosition = { x: 0, y: 0 },
    enabled = true,
    className = '',
    onDragStart,
    onDragEnd,
    position: controlledPosition // Rename to avoid conflict with state
}) => {
    const [position, setPosition] = useState(initialPosition)
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const wrapperRef = useRef()

    // Allow programmatic position updates
    useEffect(() => {
        if (controlledPosition) {
            setPosition(controlledPosition)
        }
    }, [controlledPosition])

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return
            
            const newX = e.clientX - dragOffset.x
            const newY = e.clientY - dragOffset.y
            
            setPosition({ x: newX, y: newY })
        }
        
        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false)
                onDragEnd?.(position)
                document.body.style.userSelect = ''
            }
        }
        
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, dragOffset, onDragEnd, position])

    const handleMouseDown = (e) => {
        if (!enabled) return
        
        // If handleSelector is provided, ensure we clicked inside it
        if (handleSelector) {
            const handle = wrapperRef.current?.querySelector(handleSelector)
            if (handle && !handle.contains(e.target)) return
        }
        
        // Calculate offset from top-left of the wrapper
        const rect = wrapperRef.current.getBoundingClientRect()
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        })
        
        setIsDragging(true)
        onDragStart?.()
        document.body.style.userSelect = 'none' // Prevent text selection
    }

    return (
        <div
            ref={wrapperRef}
            className={`draggable-wrapper ${className} ${isDragging ? 'grabbing' : ''}`}
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                cursor: isDragging ? 'grabbing' : (enabled && !handleSelector ? 'grab' : undefined),
                zIndex: isDragging ? 1000 : undefined, // Pop to top when dragging
                touchAction: 'none'
            }}
            onMouseDown={handleMouseDown}
        >
            {children}
        </div>
    )
}
