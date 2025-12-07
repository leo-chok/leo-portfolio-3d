import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, SIZES, INTENSITY } from '../../config/galaxyConfig'
import { HudReticle } from './HudReticle'
import { HudCallout } from './HudCallout'
import { Satellite } from './Satellite'
import { useCameraStore } from '../../stores/cameraStore'
import { useDebugStore } from '../../stores/debugStore'

/**
 * CelestialBody Component - Generic planet/moon with optional satellites
 * Handles rendering, hover states, and child satellites
 */
export const CelestialBody = ({ 
    id,
    name, 
    size = SIZES.planet,
    color = COLORS.planet,
    intensity = INTENSITY.planet,
    satellites = [],
    onClick,
    children 
}) => {
    const groupRef = useRef()
    const meshRef = useRef()
    const coreRef = useRef()
    const materialRef = useRef()
    const [hovered, setHovered] = useState(false)
    
    const registerBody = useCameraStore((state) => state.registerBody)
    const unregisterBody = useCameraStore((state) => state.unregisterBody)
    
    // Get emissive values from debug store
    const planetEmissive = useDebugStore((state) => state.planetEmissive)
    const moonEmissive = useDebugStore((state) => state.moonEmissive)
    
    // Determine if this is a planet or moon based on size
    const isPlanet = size >= SIZES.moon * 1.5
    const emissiveMultiplier = isPlanet ? planetEmissive : moonEmissive
    
    // Base color
    const baseColor = useMemo(() => new THREE.Color(color), [color])
    
    // Register this body with the camera store for navigation
    useEffect(() => {
        if (id && groupRef.current) {
            registerBody(id, groupRef, size)
        }
        return () => {
            if (id) unregisterBody(id)
        }
    }, [id, size, registerBody, unregisterBody])
    
    // Get world position for camera navigation
    const getWorldPosition = () => {
        if (groupRef.current) {
            const worldPos = new THREE.Vector3()
            groupRef.current.getWorldPosition(worldPos)
            return [worldPos.x, worldPos.y, worldPos.z]
        }
        return [0, 0, 0]
    }
    
    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime()
        
        // Self rotation
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.1
        }
        
        // Update material emissive from debug store
        if (materialRef.current) {
            const multiplier = hovered ? emissiveMultiplier * 1.5 : emissiveMultiplier
            materialRef.current.color.copy(baseColor).multiplyScalar(multiplier)
        }
        
        // Core pulse
        if (coreRef.current) {
            const pulse = 1 + Math.sin(time * 3) * 0.1
            coreRef.current.scale.set(pulse, pulse, pulse)
        }
    })
    
    // Camera tracking
    const { trackedRef, setTrackedRef, stopTracking } = useCameraStore()
    
    const handleClick = (e) => {
        e.stopPropagation()
        const worldPos = getWorldPosition()
        
        // Toggle tracking: if already tracking this body, stop and return to overview
        if (trackedRef?.current === groupRef.current) {
            stopTracking()
            // Return to overview (handled by SolarSystem navigateTo with null)
            onClick?.(null, null)
            return
        }
        
        // Register this body for camera tracking (with size and id for offset)
        setTrackedRef(groupRef, size, id)
        onClick?.(worldPos, size)
    }
    
    return (
        <group ref={groupRef}>
            {/* Main sphere - solid glowing */}
            <mesh
                ref={meshRef}
                onClick={handleClick}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true) }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false) }}
            >
                <sphereGeometry args={[size, 64, 64]} />
                <meshBasicMaterial 
                    ref={materialRef}
                    color={baseColor.clone().multiplyScalar(emissiveMultiplier)}
                    toneMapped={false}
                />
            </mesh>
            
            {/* Point light */}
            <pointLight 
                color={color} 
                intensity={intensity * 2} 
                distance={size * 10} 
                decay={2} 
            />
            
            {/* HUD - visible on hover OR when this body is being tracked */}
            <HudReticle radius={size * 1.5} visible={hovered || trackedRef?.current === groupRef.current} />
            <HudCallout name={name} visible={hovered || trackedRef?.current === groupRef.current} offset={[size + 2, size, 0]} />
            
            
            {/* Satellites - electron-style random orbital planes */}
            {satellites.map((sat, index) => {
                // Random-ish but deterministic orbital plane based on index
                const tiltX = (index * 37) % 90 // 0-90 degrees
                const tiltY = (index * 53) % 360 // 0-360 degrees
                return (
                    <Satellite
                        key={sat.name || index}
                        name={sat.name}
                        icon={sat.icon}
                        orbitRadius={size * 2.5 + (index % 3) * 0.4}
                        orbitSpeed={0.08 + (index % 5) * 0.02}
                        orbitTilt={{ x: tiltX, y: tiltY }}
                        initialAngle={(index / satellites.length) * Math.PI * 2}
                    />
                )
            })}
            
            {/* Child moons rendered externally */}
            {children}
        </group>
    )
}
