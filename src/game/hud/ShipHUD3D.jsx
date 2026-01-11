import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useSpaceshipStore } from '../../stores/spaceshipStore'
import * as THREE from 'three'

/**
 * ShipHUD3D - Minimalist sci-fi HUD with two arc gauges
 * 
 * Left arc: Speed gauge (green → yellow → orange → red)
 * Right arc: Shield/Health gauge (blue → orange → red based on level)
 * 
 * Red glitch effect when taking damage
 */
export const ShipHUD3D = () => {
    const groupRef = useRef()
    const speedBarsRef = useRef([])
    const shieldBarsRef = useRef([])
    const speedTextRef = useRef()
    const shieldTextRef = useRef()
    const glitchOffsetRef = useRef({ x: 0, y: 0 })
    
    // Arc parameters
    const arcRadius = 0.18
    const zOffset = -0.03
    
    // Arc angle ranges (from bottom to top on each side)
    const leftArcStart = 200  // Bottom left
    const leftArcEnd = 160    // Top left
    const rightArcStart = -20 // Bottom right  
    const rightArcEnd = 20    // Top right
    
    // Constants
    const MAX_SPEED = 1117
    const NUM_BARS = 15 // More bars for finer resolution
    
    useFrame((state, delta) => {
        const { speed, health, isHit } = useSpaceshipStore.getState()
        
        // Glitch effect when hit
        if (isHit) {
            glitchOffsetRef.current = {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01
            }
        } else {
            glitchOffsetRef.current = { x: 0, y: 0 }
        }
        
        // Apply glitch offset to main group
        if (groupRef.current) {
            groupRef.current.position.x = glitchOffsetRef.current.x
            groupRef.current.position.y = glitchOffsetRef.current.y
        }
        
        // Update speed bars
        const speedPercent = Math.min(speed / MAX_SPEED, 1)
        const activeBars = Math.ceil(speedPercent * NUM_BARS)
        
        speedBarsRef.current.forEach((bar, i) => {
            if (bar) {
                const isActive = i < activeBars
                const barPercent = i / NUM_BARS
                
                bar.material.opacity = isActive ? 0.9 : 0.08
                
                // If hit, flash everything red
                if (isHit) {
                    bar.material.color.setHex(0xff0000)
                } else {
                    // Normal color gradient: green → yellow → orange → red
                    if (barPercent >= 0.9) bar.material.color.setHex(0xff3333) // Red (max)
                    else if (barPercent >= 0.7) bar.material.color.setHex(0xff6633) // Orange
                    else if (barPercent >= 0.5) bar.material.color.setHex(0xffaa33) // Yellow-orange
                    else if (barPercent >= 0.3) bar.material.color.setHex(0xcccc33) // Yellow
                    else bar.material.color.setHex(0x33cc66) // Green
                }
            }
        })
        
        // Update speed text
        if (speedTextRef.current) {
            speedTextRef.current.text = `${Math.round(speed)} km/h`
            if (isHit) speedTextRef.current.color = '#ff0000'
            else speedTextRef.current.color = '#88ccff'
        }
        
        // Update shield/health bars (connected to health now)
        const shieldPercent = health / 100
        const activeShieldBars = Math.ceil(shieldPercent * NUM_BARS)
        
        shieldBarsRef.current.forEach((bar, i) => {
            if (bar) {
                const isActive = i < activeShieldBars
                bar.material.opacity = isActive ? 0.9 : 0.08
                
                // If hit, flash red
                if (isHit) {
                    bar.material.color.setHex(0xff0000)
                } else {
                    // Color based on shield level
                    if (shieldPercent > 0.5) bar.material.color.setHex(0x33aaff) // Blue
                    else if (shieldPercent > 0.2) bar.material.color.setHex(0xffaa33) // Orange
                    else bar.material.color.setHex(0xff3333) // Red
                }
            }
        })
        
        // Update shield text
        if (shieldTextRef.current) {
            shieldTextRef.current.text = `${Math.round(shieldPercent * 100)}%`
            if (isHit) shieldTextRef.current.color = '#ff0000'
            else if (shieldPercent > 0.5) shieldTextRef.current.color = '#33aaff'
            else if (shieldPercent > 0.2) shieldTextRef.current.color = '#ffaa33'
            else shieldTextRef.current.color = '#ff3333'
        }
    })
    
    // Create arc geometries
    const createArcGeometry = (startDeg, endDeg) => {
        const points = []
        const startAngle = THREE.MathUtils.degToRad(startDeg)
        const endAngle = THREE.MathUtils.degToRad(endDeg)
        const segments = 60
        
        for (let i = 0; i <= segments; i++) {
            const angle = startAngle + (i / segments) * (endAngle - startAngle)
            points.push(new THREE.Vector3(
                Math.cos(angle) * arcRadius,
                Math.sin(angle) * arcRadius,
                0
            ))
        }
        return new THREE.BufferGeometry().setFromPoints(points)
    }
    
    const leftArcGeometry = useMemo(() => createArcGeometry(leftArcStart, leftArcEnd), [])
    const rightArcGeometry = useMemo(() => createArcGeometry(rightArcStart, rightArcEnd), [])
    
    // Inner decorative arcs (thinner, more transparent)
    const leftInnerArcGeometry = useMemo(() => createArcGeometry(leftArcStart + 5, leftArcEnd - 5), [])
    const rightInnerArcGeometry = useMemo(() => createArcGeometry(rightArcStart + 5, rightArcEnd - 5), [])
    
    // Generate bar positions along arc
    const generateBarPositions = (startDeg, endDeg, count, isOuter = true) => {
        const bars = []
        const offset = isOuter ? 0.012 : -0.012
        
        for (let i = 0; i < count; i++) {
            // Distribute bars evenly along the arc
            const t = (i + 0.5) / count
            const angle = THREE.MathUtils.degToRad(startDeg + t * (endDeg - startDeg))
            
            bars.push({
                x: Math.cos(angle) * (arcRadius + offset),
                y: Math.sin(angle) * (arcRadius + offset),
                rotation: angle + Math.PI / 2
            })
        }
        return bars
    }
    
    const speedBarPositions = useMemo(() => 
        generateBarPositions(leftArcStart, leftArcEnd, NUM_BARS, true), [])
    const shieldBarPositions = useMemo(() => 
        generateBarPositions(rightArcStart, rightArcEnd, NUM_BARS, true), [])
    
    // Generate tick marks
    const generateTicks = (startDeg, endDeg, count) => {
        const ticks = []
        for (let i = 0; i <= count; i++) {
            const t = i / count
            const angle = THREE.MathUtils.degToRad(startDeg + t * (endDeg - startDeg))
            const isMain = i === 0 || i === count || i === count / 2
            const length = isMain ? 0.012 : 0.005
            
            ticks.push({
                x1: Math.cos(angle) * (arcRadius - length),
                y1: Math.sin(angle) * (arcRadius - length),
                x2: Math.cos(angle) * arcRadius,
                y2: Math.sin(angle) * arcRadius,
                isMain
            })
        }
        return ticks
    }
    
    const leftTicks = useMemo(() => generateTicks(leftArcStart, leftArcEnd, 20), [])
    const rightTicks = useMemo(() => generateTicks(rightArcStart, rightArcEnd, 20), [])
    
    const textStyle = {
        fontSize: 0.006,
        color: '#6ab8e0',
        anchorX: 'center',
        anchorY: 'middle',
    }
    
    return (
        <group ref={groupRef} position={[0, 0, zOffset]}>
            {/* === LEFT ARC - SPEED === */}
            
            {/* Outer arc line */}
            <line geometry={leftArcGeometry}>
                <lineBasicMaterial color="#4a90b5" transparent opacity={0.4} />
            </line>
            
            {/* Inner decorative arc */}
            <group scale={[0.92, 0.92, 1]}>
                <line geometry={leftInnerArcGeometry}>
                    <lineBasicMaterial color="#4a90b5" transparent opacity={0.15} />
                </line>
            </group>
            
            {/* Tick marks */}
            {leftTicks.map((tick, i) => (
                <line key={`lt${i}`}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={2}
                            array={new Float32Array([tick.x1, tick.y1, 0, tick.x2, tick.y2, 0])}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="#4a90b5" transparent opacity={tick.isMain ? 0.5 : 0.2} />
                </line>
            ))}
            
            {/* Speed bars */}
            {speedBarPositions.map((pos, i) => (
                <mesh 
                    key={`sb${i}`}
                    ref={(el) => speedBarsRef.current[i] = el}
                    position={[pos.x, pos.y, 0]}
                    rotation={[0, 0, pos.rotation]}
                >
                    <planeGeometry args={[0.003, 0.012]} />
                    <meshBasicMaterial color="#33cc66" transparent opacity={0.08} />
                </mesh>
            ))}
            
            {/* Speed label */}
            <Text 
                position={[
                    Math.cos(THREE.MathUtils.degToRad(180)) * (arcRadius - 0.025),
                    Math.sin(THREE.MathUtils.degToRad(180)) * (arcRadius - 0.025),
                    0
                ]} 
                {...textStyle}
            >
                SPD
            </Text>
            
            {/* Speed value - bottom left corner, horizontal */}
            <Text 
                ref={speedTextRef}
                position={[-arcRadius - 0.006, -arcRadius + 0.109, 0]} 
                rotation={[0, 0, 195.1]}
                {...textStyle}
                fontSize={0.006}
                anchorX="left"
                anchorY="top"
            >
                0 km/h
            </Text>
            
            {/* === RIGHT ARC - SHIELD === */}
            
            {/* Outer arc line */}
            <line geometry={rightArcGeometry}>
                <lineBasicMaterial color="#4a90b5" transparent opacity={0.4} />
            </line>
            
            {/* Inner decorative arc */}
            <group scale={[0.92, 0.92, 1]}>
                <line geometry={rightInnerArcGeometry}>
                    <lineBasicMaterial color="#4a90b5" transparent opacity={0.15} />
                </line>
            </group>
            
            {/* Tick marks */}
            {rightTicks.map((tick, i) => (
                <line key={`rt${i}`}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={2}
                            array={new Float32Array([tick.x1, tick.y1, 0, tick.x2, tick.y2, 0])}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="#4a90b5" transparent opacity={tick.isMain ? 0.5 : 0.2} />
                </line>
            ))}
            
            {/* Shield bars */}
            {shieldBarPositions.map((pos, i) => (
                <mesh 
                    key={`shb${i}`}
                    ref={(el) => shieldBarsRef.current[i] = el}
                    position={[pos.x, pos.y, 0]}
                    rotation={[0, 0, pos.rotation]}
                >
                    <planeGeometry args={[0.003, 0.012]} />
                    <meshBasicMaterial color="#33aaff" transparent opacity={0.9} />
                </mesh>
            ))}
            
            {/* Shield label */}
            <Text 
                position={[
                    Math.cos(THREE.MathUtils.degToRad(0)) * (arcRadius - 0.025),
                    Math.sin(THREE.MathUtils.degToRad(0)) * (arcRadius - 0.025),
                    0
                ]} 
                {...textStyle}
            >
                SHD
            </Text>
            
            {/* Shield value - bottom right corner, horizontal */}
            <Text 
                ref={shieldTextRef}
                position={[arcRadius - 0.0, -arcRadius + 0.110, 0]} 
                rotation={[0, 0, 251]}
                {...textStyle}
                fontSize={0.006}
                anchorX="right"
                anchorY="top"
            >
                100%
            </Text>
            
            {/* === DECORATIVE CORNER ACCENTS === */}
            {[leftArcStart, leftArcEnd, rightArcStart, rightArcEnd].map((deg, i) => {
                const angle = THREE.MathUtils.degToRad(deg)
                return (
                    <mesh 
                        key={`acc${i}`}
                        position={[
                            Math.cos(angle) * (arcRadius + 0.005),
                            Math.sin(angle) * (arcRadius + 0.005),
                            0
                        ]}
                        rotation={[0, 0, angle]}
                    >
                        <planeGeometry args={[0.008, 0.002]} />
                        <meshBasicMaterial color="#6ab8e0" transparent opacity={0.6} />
                    </mesh>
                )
            })}
        </group>
    )
}
