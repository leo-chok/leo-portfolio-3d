import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Line, Text } from '@react-three/drei'
import * as THREE from 'three'

const HUD_COLOR = '#00d4ff'
const HUD_COLOR_DIM = '#0088aa'
const HUD_COLOR_ACCENT = '#00ffff'

/**
 * HudReticle - Professional Sci-Fi Targeting System
 * Inspired by Elite Dangerous, Star Citizen, Iron Man HUD
 * 
 * Features:
 * - Outer rotating ring with tick marks
 * - Inner targeting brackets (corners)
 * - Center crosshair with dot
 * - Distance/scan data readout
 * - Animated lock-on effect
 */
export const HudReticle = ({ radius = 3.2, visible = false, isTracked = false }) => {
    const outerRingRef = useRef()
    const innerRingRef = useRef()
    const scanLineRef = useRef()
    const bracketsRef = useRef()
    const [lockProgress, setLockProgress] = useState(0)
    
    // Animation
    useFrame((state, delta) => {
        if (!visible) return
        const time = state.clock.getElapsedTime()
        
        // Outer ring - slow continuous rotation
        if (outerRingRef.current) {
            outerRingRef.current.rotation.z = time * 0.1
        }
        
        // Inner ring - counter-rotation, faster
        if (innerRingRef.current) {
            innerRingRef.current.rotation.z = -time * 0.2
        }
        
        // Scan line pulse
        if (scanLineRef.current) {
            scanLineRef.current.rotation.z = time * 0.5
        }
        
        // Brackets breathing animation (scale in/out) - 1 second cycle
        if (bracketsRef.current) {
            const breathe = 1 + Math.sin(time * Math.PI * 2) * 0.08 // 1 second cycle, 8% scale
            bracketsRef.current.scale.set(breathe, breathe, 1)
        }
        
        // Lock-on progress when tracked
        if (isTracked && lockProgress < 1) {
            setLockProgress(prev => Math.min(prev + delta * 2, 1))
        } else if (!isTracked && lockProgress > 0) {
            setLockProgress(prev => Math.max(prev - delta * 3, 0))
        }
    })
    
    // Outer ring with tick marks
    const outerRingPoints = useMemo(() => {
        const points = []
        const segments = 64
        // Ring hugs the planet closer (just slightly larger than base radius)
        const outerR = radius * 1.05
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2
            points.push(new THREE.Vector3(
                Math.cos(angle) * outerR,
                Math.sin(angle) * outerR,
                0
            ))
        }
        return points
    }, [radius])
    
    // Tick marks on outer ring (every 30 degrees)
    const tickMarks = useMemo(() => {
        const ticks = []
        const outerR = radius * 1.05
        const tickLength = radius * 0.08
        
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2
            const isMain = i % 3 === 0 // Main ticks every 90 degrees
            const len = isMain ? tickLength * 1.5 : tickLength
            
            ticks.push([
                new THREE.Vector3(Math.cos(angle) * outerR, Math.sin(angle) * outerR, 0),
                new THREE.Vector3(Math.cos(angle) * (outerR - len), Math.sin(angle) * (outerR - len), 0)
            ])
        }
        return ticks
    }, [radius])
    
    // Inner targeting brackets (4 corners) - moved further out behind ring
    const targetingBrackets = useMemo(() => {
        const brackets = []
        // Brackets are much larger now, floating behind/outside the ring
        const innerR = radius * 1.45 
        const bracketSize = radius * 0.25
        const angles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4]
        
        angles.forEach(angle => {
            const x = Math.cos(angle) * innerR
            const y = Math.sin(angle) * innerR
            
            // L-shaped bracket
            const perpAngle1 = angle + Math.PI / 4
            const perpAngle2 = angle - Math.PI / 4
            
            brackets.push([
                new THREE.Vector3(
                    x + Math.cos(perpAngle1) * bracketSize,
                    y + Math.sin(perpAngle1) * bracketSize, 0
                ),
                new THREE.Vector3(x, y, 0),
                new THREE.Vector3(
                    x + Math.cos(perpAngle2) * bracketSize,
                    y + Math.sin(perpAngle2) * bracketSize, 0
                )
            ])
        })
        return brackets
    }, [radius])
    
    // Scan line (rotating dashed line)
    const scanLine = useMemo(() => {
        return [
            new THREE.Vector3(-radius * 0.6, 0, 0),
            new THREE.Vector3(radius * 0.6, 0, 0)
        ]
    }, [radius])
    
    // Center crosshair
    const crosshair = useMemo(() => {
        const size = radius * 0.15
        const gap = radius * 0.05
        return {
            horizontal: [
                [new THREE.Vector3(-size, 0, 0), new THREE.Vector3(-gap, 0, 0)],
                [new THREE.Vector3(gap, 0, 0), new THREE.Vector3(size, 0, 0)]
            ],
            vertical: [
                [new THREE.Vector3(0, -size, 0), new THREE.Vector3(0, -gap, 0)],
                [new THREE.Vector3(0, gap, 0), new THREE.Vector3(0, size, 0)]
            ]
        }
    }, [radius])
    
    // Mini arcs for lock-on effect
    const lockArcs = useMemo(() => {
        const arcs = []
        const arcRadius = radius * 0.5
        const arcLength = Math.PI / 6
        
        for (let i = 0; i < 4; i++) {
            const startAngle = (i * Math.PI / 2) + Math.PI / 4 - arcLength / 2
            const points = []
            
            for (let j = 0; j <= 8; j++) {
                const angle = startAngle + (j / 8) * arcLength
                points.push(new THREE.Vector3(
                    Math.cos(angle) * arcRadius,
                    Math.sin(angle) * arcRadius,
                    0
                ))
            }
            arcs.push(points)
        }
        return arcs
    }, [radius])
    
    if (!visible) return null
    
    const lockOpacity = 0.3 + lockProgress * 0.7
    
    return (
        <Billboard follow={true}>
            {/* Outer rotating ring with graduations */}
            <group ref={outerRingRef}>
                <Line
                    points={outerRingPoints}
                    color={HUD_COLOR_DIM}
                    lineWidth={1}
                    transparent
                    opacity={0.25}
                />
                
                {/* Tick marks (graduations) */}
                {tickMarks.map((tick, i) => (
                    <Line
                        key={`tick-${i}`}
                        points={tick}
                        color={HUD_COLOR}
                        lineWidth={i % 3 === 0 ? 2 : 1}
                        transparent
                        opacity={i % 3 === 0 ? 0.6 : 0.3}
                    />
                ))}
            </group>
            
            {/* 4 corner brackets with breathing animation */}
            <group ref={bracketsRef}>
                {targetingBrackets.map((bracket, i) => (
                    <Line
                        key={`bracket-${i}`}
                        points={bracket}
                        color={HUD_COLOR}
                        lineWidth={2.5}
                        transparent
                        opacity={lockOpacity}
                    />
                ))}
            </group>
        </Billboard>
    )
}
