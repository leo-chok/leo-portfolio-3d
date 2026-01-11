import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { useWindowStore } from '../../../stores/windowStore'
import { useDecryptingText } from '../../../utils/textUtils'

const HUD_COLOR = '#00d4ff'
const HUD_COLOR_DIM = '#0088aa'
const HUD_COLOR_ACCENT = '#00ffff'

/**
 * HudCallout - Professional Sci-Fi Data Panel (Optimized)
 * 
 * PERFORMANCE: Uses refs for animation, updates geometry in useFrame
 * No React re-renders during line drawing animation.
 * 
 * When isTracked=true, positions callout further away for zoomed-in view.
 */
export const HudCallout = ({ name, sectionId, visible = false, isTracked = false, offset = [2.5, 1.5, 0], classification = 'SECTOR' }) => {
    const groupRef = useRef()
    const lineRef = useRef()
    const textRef = useRef()
    const panelGroupRef = useRef()
    const originDotRef = useRef()
    const connectionDotRef = useRef()
    
    // Animation refs (no re-renders)
    const drawProgressRef = useRef(0)
    const targetProgressRef = useRef(0)
    const showTextRef = useRef(false)
    
    // Current offset (animated)
    const currentOffsetRef = useRef([...offset])
    
    // State only for text visibility (one-time toggle)
    const [showText, setShowText] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    
    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])
    
    // Get analysis state from store
    const analyzedSections = useWindowStore((state) => state.analyzedSections)
    const decryptingSection = useWindowStore((state) => state.decryptingSection)
    
    const isAnalyzed = sectionId ? analyzedSections.has(sectionId) : false
    const isDecrypting = sectionId && decryptingSection === sectionId
    
    const decryptDuration = 500
    const displayName = useDecryptingText(name, isDecrypting, decryptDuration, isAnalyzed)
    
    // Generate pseudo-coordinates based on name
    const coordinates = useMemo(() => {
        if (!name) return 'XX.XX.XX'
        const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
        const x = ((hash * 17) % 360).toFixed(1)
        const y = ((hash * 23) % 90).toFixed(1)
        const z = ((hash * 31) % 100).toFixed(1)
        return `${x}° ${y}° ${z}`
    }, [name])
    
    // Panel dimensions
    const panelWidth = Math.max(name.length * 0.4, 4.5)
    const panelHeight = 2.4
    
    // Tracked offset - larger when zoomed, capped to stay on screen
    const trackedOffset = useMemo(() => {
        const maxX = 6  // Max X offset when tracked
        const maxY = 8  // Max Y offset when tracked
        return [
            Math.min(offset[0] * 2.5, maxX),
            Math.min(offset[1] * 4, maxY),
            0
        ]
    }, [offset])
    
    // Pre-compute line waypoints - will be updated in useFrame
    const lineWaypointsRef = useRef({
        origin: new THREE.Vector3(0, 0, 0),
        elbow: new THREE.Vector3(0, 0, 0),
        end: new THREE.Vector3(0, 0, 0)
    })
    
    // Create line geometry with enough vertices for smooth animation
    const lineGeometry = useMemo(() => {
        // 20 points for smooth animation
        const points = Array(20).fill(null).map(() => new THREE.Vector3(0, 0, 0))
        const geo = new THREE.BufferGeometry().setFromPoints(points)
        return geo
    }, [])
    
    // Visibility effect - just set target
    useEffect(() => {
        if (visible) {
            targetProgressRef.current = 1
            drawProgressRef.current = 0
            showTextRef.current = false
            setShowText(false)
        } else {
            targetProgressRef.current = 0
            drawProgressRef.current = 0
            showTextRef.current = false
            setShowText(false)
        }
    }, [visible])
    
    // Reusable vectors
    const tempVec = useRef(new THREE.Vector3())
    const worldPosRef = useRef(new THREE.Vector3())
    
    // Fixed screen position for panel (in "screen units")
    const FIXED_SCREEN_X = 4.5
    const FIXED_SCREEN_Y = 3.5
    const BASE_DISTANCE = 25 // Reference distance for scale calculation
    
    // Frame update - animate line and scaling
    useFrame((state, delta) => {
        if (!visible && drawProgressRef.current === 0) return
        
        // Get distance from camera to body
        if (!groupRef.current) return
        groupRef.current.getWorldPosition(worldPosRef.current)
        const distance = state.camera.position.distanceTo(worldPosRef.current)
        const distanceScale = Math.max(1, distance / BASE_DISTANCE)
        
        // ===== FIXED SCREEN POSITION CALCULATION =====
        // Panel position scales with distance to appear at same screen location
        const panelX = FIXED_SCREEN_X * distanceScale
        const panelY = FIXED_SCREEN_Y * distanceScale
        
        // Lerp current offset toward target for smooth transition
        currentOffsetRef.current[0] = THREE.MathUtils.lerp(currentOffsetRef.current[0], panelX, delta * 4)
        currentOffsetRef.current[1] = THREE.MathUtils.lerp(currentOffsetRef.current[1], panelY, delta * 4)
        
        const currOffset = currentOffsetRef.current
        
        // Update line waypoints - line connects origin to panel
        const lw = lineWaypointsRef.current
        // Elbow at 30% of the way
        lw.elbow.set(currOffset[0] * 0.3, currOffset[1] * 0.4, 0)
        // End at panel corner
        lw.end.set(currOffset[0] - 0.2 * distanceScale, currOffset[1] - 0.3 * distanceScale, 0)
        
        // Lerp progress
        const target = targetProgressRef.current
        const current = drawProgressRef.current
        
        if (Math.abs(target - current) > 0.001) {
            drawProgressRef.current = THREE.MathUtils.lerp(current, target, delta * 6)
        } else {
            drawProgressRef.current = target
        }
        
        const progress = drawProgressRef.current
        
        // Update origin dot opacity (stays at body)
        if (originDotRef.current) {
            originDotRef.current.material.opacity = progress * 0.9
        }
        
        // Update line geometry points based on progress
        if (lineRef.current && lineRef.current.geometry) {
            const positions = lineRef.current.geometry.attributes.position.array
            const numPoints = 20
            const { origin, elbow, end } = lw
            
            for (let i = 0; i < numPoints; i++) {
                const t = i / (numPoints - 1)
                const drawn = Math.min(t / Math.max(progress, 0.001), 1)
                
                let point
                if (drawn > 1) {
                    point = tempVec.current.set(0, 0, 0)
                } else {
                    const pathT = t * progress
                    
                    if (pathT < 0.4) {
                        const segT = pathT / 0.4
                        point = tempVec.current.lerpVectors(origin, elbow, segT)
                    } else {
                        const segT = (pathT - 0.4) / 0.6
                        point = tempVec.current.lerpVectors(elbow, end, Math.min(segT, 1))
                    }
                }
                
                positions[i * 3] = point.x
                positions[i * 3 + 1] = point.y
                positions[i * 3 + 2] = point.z
            }
            
            lineRef.current.geometry.attributes.position.needsUpdate = true
            lineRef.current.material.opacity = 0.7 * Math.min(progress * 2, 1)
        }
        
        // Update connection dot position (at panel corner)
        if (connectionDotRef.current) {
            connectionDotRef.current.position.set(
                currOffset[0] - 0.2 * distanceScale, 
                currOffset[1] - 0.3 * distanceScale, 
                0
            )
            // Scale the dot with distance
            connectionDotRef.current.scale.setScalar(distanceScale)
            connectionDotRef.current.visible = progress >= 0.95
        }
        
        // Update panel position and scale for fixed screen appearance
        if (panelGroupRef.current) {
            panelGroupRef.current.position.set(currOffset[0], currOffset[1], 0)
            // Scale panel with distance so it appears SAME SIZE on screen
            panelGroupRef.current.scale.setScalar(distanceScale)
            panelGroupRef.current.visible = showTextRef.current
        }
        
        // Show text when line almost complete
        if (progress >= 0.9 && !showTextRef.current) {
            showTextRef.current = true
            setShowText(true)
        }
        
        // Text pulse effect
        if (showTextRef.current && textRef.current) {
            const time = state.clock.getElapsedTime()
            textRef.current.material.opacity = 0.85 + Math.sin(time * 2) * 0.15
        }
        
        // NO scaling of the main group - keep it at 1
        // This ensures the origin dot stays at the body position
    })
    
    // Panel frame corners (static)
    const panelFrame = useMemo(() => {
        const cornerSize = 0.2
        const x = -0.2
        const y = -0.3
        const w = panelWidth
        const h = panelHeight
        
        return {
            topLeft: [[x, y + h - cornerSize, 0], [x, y + h, 0], [x + cornerSize, y + h, 0]],
            topRight: [[x + w - cornerSize, y + h, 0], [x + w, y + h, 0], [x + w, y + h - cornerSize, 0]],
            bottomLeft: [[x, y + cornerSize, 0], [x, y, 0], [x + cornerSize, y, 0]],
            bottomRight: [[x + w - cornerSize, y, 0], [x + w, y, 0], [x + w, y + cornerSize, 0]]
        }
    }, [panelWidth, panelHeight])
    
    // Static line geometries for frame
    const frameGeometries = useMemo(() => {
        const createLineGeo = (points) => new THREE.BufferGeometry().setFromPoints(
            points.map(p => new THREE.Vector3(...p))
        )
        return {
            corners: Object.values(panelFrame).map(createLineGeo),
            topEdge: createLineGeo([[-0.2, panelHeight - 0.3, 0], [panelWidth - 0.2, panelHeight - 0.3, 0]]),
            divider: createLineGeo([[-0.1, 0.9, 0], [panelWidth - 0.3, 0.9, 0]]),
            bottomEdge: createLineGeo([[-0.2, -0.3, 0], [panelWidth - 0.2, -0.3, 0]])
        }
    }, [panelFrame, panelWidth, panelHeight])
    
    // Hide on mobile or when not visible
    if (isMobile || (!visible && drawProgressRef.current === 0)) return null
    
    const statusText = isAnalyzed ? '● DECODED' : (isDecrypting ? '○ SCANNING' : '○ ENCRYPTED')
    const statusColor = isAnalyzed ? '#64edb4' : (isDecrypting ? '#ffaa00' : HUD_COLOR_DIM)

    return (
        <Billboard ref={groupRef} follow={true} lockX={false} lockY={false} lockZ={false}>
            {/* Connection dot at origin */}
            <mesh ref={originDotRef}>
                <circleGeometry args={[0.06, 16]} />
                <meshBasicMaterial 
                    color={HUD_COLOR_ACCENT}
                    transparent
                    opacity={0}
                    toneMapped={false}
                />
            </mesh>
            
            {/* Leader line - geometry updated in useFrame */}
            <line ref={lineRef} geometry={lineGeometry}>
                <lineBasicMaterial 
                    color={HUD_COLOR} 
                    transparent 
                    opacity={0}
                    toneMapped={false}
                />
            </line>
            
            {/* Connection Node at end of line - position set in useFrame */}
            <mesh 
                ref={connectionDotRef}
                visible={false}
            >
                <circleGeometry args={[0.08, 16]} />
                <meshBasicMaterial 
                    color={HUD_COLOR_ACCENT}
                    transparent
                    opacity={0.8}
                    toneMapped={false}
                />
                <mesh position={[0, 0, 0.01]}>
                    <circleGeometry args={[0.04, 16]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.8} toneMapped={false} />
                </mesh>
            </mesh>

            {/* Data Panel - position set in useFrame */}
            <group ref={panelGroupRef} visible={false}>
                {/* Panel background glow */}
                <mesh position={[panelWidth/2 - 0.2, panelHeight/2 - 0.3, -0.01]}>
                    <planeGeometry args={[panelWidth + 0.2, panelHeight + 0.2]} />
                    <meshBasicMaterial 
                        color={HUD_COLOR}
                        transparent
                        opacity={0.05}
                        toneMapped={false}
                    />
                </mesh>
                
                {/* Frame corners */}
                {frameGeometries.corners.map((geo, i) => (
                    <line key={`corner-${i}`} geometry={geo}>
                        <lineBasicMaterial color={HUD_COLOR} transparent opacity={0.8} toneMapped={false} />
                    </line>
                ))}
                
                {/* Top edge line */}
                <line geometry={frameGeometries.topEdge}>
                    <lineBasicMaterial color={HUD_COLOR_DIM} transparent opacity={0.3} toneMapped={false} />
                </line>
                
                {/* Classification label */}
                <Text
                    position={[0, panelHeight - 0.5, 0]}
                    fontSize={0.16}
                    color={HUD_COLOR_DIM}
                    anchorX="left"
                    anchorY="top"
                    font="/fonts/Orbitron-Bold.ttf"
                    letterSpacing={0.12}
                >
                    {classification}
                    <meshBasicMaterial color={HUD_COLOR_DIM} transparent opacity={0.6} toneMapped={false} />
                </Text>
                
                {/* Main name */}
                <Text
                    ref={textRef}
                    position={[0, 1.0, 0]}
                    fontSize={0.4}
                    color={HUD_COLOR}
                    anchorX="left"
                    anchorY="bottom"
                    font="/fonts/Orbitron-Bold.ttf"
                    letterSpacing={0.06}
                >
                    {displayName}
                    <meshBasicMaterial 
                        color={HUD_COLOR} 
                        transparent 
                        opacity={1}
                        toneMapped={false}
                    />
                </Text>
                
                {/* Divider line */}
                <line geometry={frameGeometries.divider}>
                    <lineBasicMaterial color={HUD_COLOR} transparent opacity={0.4} toneMapped={false} />
                </line>
                
                {/* Status indicator */}
                <Text
                    position={[0, 0.55, 0]}
                    fontSize={0.15}
                    color={statusColor}
                    anchorX="left"
                    anchorY="top"
                    font="/fonts/Orbitron-Bold.ttf"
                    letterSpacing={0.08}
                >
                    {statusText}
                    <meshBasicMaterial color={statusColor} transparent opacity={0.9} toneMapped={false} />
                </Text>
                
                {/* Coordinates */}
                <Text
                    position={[panelWidth - 0.4, 0.55, 0]}
                    fontSize={0.13}
                    color={HUD_COLOR_DIM}
                    anchorX="right"
                    anchorY="top"
                    font="/fonts/Orbitron-Bold.ttf"
                    letterSpacing={0.04}
                >
                    {coordinates}
                    <meshBasicMaterial color={HUD_COLOR_DIM} transparent opacity={0.5} toneMapped={false} />
                </Text>
                
                {/* Bottom info bar */}
                <line geometry={frameGeometries.bottomEdge}>
                    <lineBasicMaterial color={HUD_COLOR_DIM} transparent opacity={0.3} toneMapped={false} />
                </line>
            </group>
        </Billboard>
    )
}
