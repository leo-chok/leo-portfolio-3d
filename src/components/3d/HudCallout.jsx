import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Line, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { useWindowStore } from '../../stores/windowStore'
import { useDecryptingText } from '../../utils/textUtils'

const HUD_COLOR = '#00d4ff'
const HUD_COLOR_DIM = '#0088aa'
const HUD_COLOR_ACCENT = '#00ffff'

/**
 * HudCallout - Professional Sci-Fi Data Panel
 * Inspired by Iron Man HUD, Elite Dangerous targeting info
 * 
 * Features:
 * - Animated leader line with angle
 * - Data panel with frame
 * - Classification indicator
 * - Scanning effect
 * - Coordinate readout
 */
export const HudCallout = ({ name, sectionId, visible = false, offset = [4, 3, 0], classification = 'SECTOR' }) => {
    const groupRef = useRef()
    const lineRef = useRef()
    const textRef = useRef()
    const [drawProgress, setDrawProgress] = useState(0)
    const [showText, setShowText] = useState(false)
    const [scanPulse, setScanPulse] = useState(0)
    
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
    
    // Panel dimensions - bigger for better text spacing
    const panelWidth = Math.max(name.length * 0.4, 4.5)
    const panelHeight = 2.4
    
    // Leader line path (origin -> elbow -> panel bottom-left)
    const linePoints = useMemo(() => {
        if (drawProgress === 0) return [[0, 0, 0], [0, 0, 0]]
        
        const elbowX = offset[0] * 0.2
        const elbowY = offset[1] * 0.4
        // Target: Bottom-left corner of the frame relative to offset position
        // Frame starts at x=-0.2, y=-0.3. So target is offset + (-0.2, -0.3)
        const endX = offset[0] - 0.2
        const endY = offset[1] - 0.3
        
        const t = drawProgress
        
        if (t < 0.4) {
            // First segment: origin to elbow
            const p = t / 0.4
            return [
                [0, 0, 0],
                [elbowX * p, elbowY * p, 0]
            ]
        } else {
            // Second segment: elbow to end
            const p = (t - 0.4) / 0.6
            return [
                [0, 0, 0],
                [elbowX, elbowY, 0],
                [elbowX + (endX - elbowX) * p, elbowY + (endY - elbowY) * p, 0]
            ]
        }
    }, [drawProgress, offset])
    
    // Animation timeline
    useEffect(() => {
        let tween = null
        
        if (visible) {
            setDrawProgress(0)
            setShowText(false)
            setScanPulse(0)
            
            tween = gsap.to({ progress: 0 }, {
                progress: 1,
                duration: 0.5,
                ease: 'power2.out',
                onUpdate: function() {
                    setDrawProgress(this.targets()[0].progress)
                },
                onComplete: () => {
                    setShowText(true)
                    // Start scan pulse
                    gsap.to({ pulse: 0 }, {
                        pulse: 1,
                        duration: 0.3,
                        onUpdate: function() {
                            setScanPulse(this.targets()[0].pulse)
                        }
                    })
                }
            })
        } else {
            setDrawProgress(0)
            setShowText(false)
            setScanPulse(0)
        }
        
        return () => {
            if (tween) tween.kill()
            setDrawProgress(0)
            setShowText(false)
        }
    }, [visible])
    
    // Subtle animations and dynamic scaling
    useFrame((state) => {
        if (!visible) return
        const time = state.clock.getElapsedTime()
        
        if (showText && textRef.current) {
            textRef.current.material.opacity = 0.85 + Math.sin(time * 2) * 0.15
        }
        
        // Dynamic scaling based on distance
        if (groupRef.current) {
            const worldPos = new THREE.Vector3()
            groupRef.current.getWorldPosition(worldPos)
            const distance = state.camera.position.distanceTo(worldPos)
            
            // Scale based on distance to maintain legible size
            // Base scale 1 at distance ~25, scales up linearly
            const scaleFactor = Math.max(1, distance / 25)
            groupRef.current.scale.setScalar(scaleFactor)
        }
    })
    
    // Panel frame corners
    const panelFrame = useMemo(() => {
        const cornerSize = 0.2
        const x = -0.2
        const y = -0.3
        const w = panelWidth
        const h = panelHeight
        
        return {
            topLeft: [
                [x, y + h - cornerSize, 0],
                [x, y + h, 0],
                [x + cornerSize, y + h, 0]
            ],
            topRight: [
                [x + w - cornerSize, y + h, 0],
                [x + w, y + h, 0],
                [x + w, y + h - cornerSize, 0]
            ],
            bottomLeft: [
                [x, y + cornerSize, 0],
                [x, y, 0],
                [x + cornerSize, y, 0]
            ],
            bottomRight: [
                [x + w - cornerSize, y, 0],
                [x + w, y, 0],
                [x + w, y + cornerSize, 0]
            ]
        }
    }, [panelWidth, panelHeight])
    
    // Horizontal divider line - positioned at 0.9
    const dividerLine = useMemo(() => {
        return [
            [-0.1, 0.9, 0],
            [panelWidth - 0.3, 0.9, 0]
        ]
    }, [panelWidth])
    
    if (!visible && drawProgress === 0) return null
    
    const statusText = isAnalyzed ? '● DECODED' : (isDecrypting ? '○ SCANNING' : '○ ENCRYPTED')
    const statusColor = isAnalyzed ? '#64edb4' : (isDecrypting ? '#ffaa00' : HUD_COLOR_DIM)

    return (
        <Billboard ref={groupRef} follow={true} lockX={false} lockY={false} lockZ={false}>
            {/* Connection dot at origin */}
            <mesh>
                <circleGeometry args={[0.06, 16]} />
                <meshBasicMaterial 
                    color={HUD_COLOR_ACCENT}
                    transparent
                    opacity={drawProgress * 0.9}
                    toneMapped={false}
                />
            </mesh>
            
            {/* Animated leader line */}
            {drawProgress > 0 && (
                <Line
                    ref={lineRef}
                    points={linePoints}
                    color={HUD_COLOR}
                    lineWidth={1.5}
                    transparent
                    opacity={0.7}
                    toneMapped={false}
                />
            )}
            
            {/* Connection Node (Blinking Data Circle) at bottom-left */}
            {drawProgress >= 1 && (
                <mesh position={[offset[0] - 0.2, offset[1] - 0.3, 0]}>
                    <circleGeometry args={[0.08, 16]} />
                    <meshBasicMaterial 
                        color={HUD_COLOR_ACCENT}
                        transparent
                        opacity={0.5 + Math.sin(Date.now() * 0.01) * 0.5} // Blinking effect handled in useFrame normally, simple here
                        toneMapped={false}
                    />
                    {/* Inner core */}
                    <mesh position={[0, 0, 0.01]}>
                        <circleGeometry args={[0.04, 16]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} toneMapped={false} />
                    </mesh>
                </mesh>
            )}

            {/* Data Panel */}
            {showText && (
                <group position={offset}>
                    {/* Panel background glow */}
                    <mesh position={[panelWidth/2 - 0.2, panelHeight/2 - 0.3, -0.01]}>
                        <planeGeometry args={[panelWidth + 0.2, panelHeight + 0.2]} />
                        <meshBasicMaterial 
                            color={HUD_COLOR}
                            transparent
                            opacity={0.03 + scanPulse * 0.02}
                            toneMapped={false}
                        />
                    </mesh>
                    
                    {/* Frame corners */}
                    {Object.values(panelFrame).map((corner, i) => (
                        <Line
                            key={`corner-${i}`}
                            points={corner}
                            color={HUD_COLOR}
                            lineWidth={2}
                            transparent
                            opacity={0.8}
                            toneMapped={false}
                        />
                    ))}
                    
                    {/* Top edge line (partial) */}
                    <Line
                        points={[[-0.2, panelHeight - 0.3, 0], [panelWidth - 0.2, panelHeight - 0.3, 0]]}
                        color={HUD_COLOR_DIM}
                        lineWidth={1}
                        transparent
                        opacity={0.3}
                        toneMapped={false}
                    />
                    
                    {/* Classification label - at top */}
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
                    
                    {/* Main name - middle */}
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
                    <Line
                        points={dividerLine}
                        color={HUD_COLOR}
                        lineWidth={1}
                        transparent
                        opacity={0.4}
                        toneMapped={false}
                    />
                    
                    {/* Status indicator - below divider */}
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
                    
                    {/* Coordinates - below divider, right side */}
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
                    <Line
                        points={[[-0.2, -0.3, 0], [panelWidth - 0.2, -0.3, 0]]}
                        color={HUD_COLOR_DIM}
                        lineWidth={1}
                        transparent
                        opacity={0.3}
                        toneMapped={false}
                    />
                </group>
            )}
        </Billboard>
    )
}
