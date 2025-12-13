import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, SIZES, INTENSITY } from '../../config/galaxyConfig'
import { HudReticle } from './HudReticle'
import { HudCallout } from './HudCallout'
import { Satellite } from './Satellite'
import { FresnelGlowMaterial } from './FresnelGlowMaterial'
import { useCameraStore } from '../../stores/cameraStore'
import { useDebugStore } from '../../stores/debugStore'

/**
 * CelestialBody Component - Optimized for performance
 * Color updates only on hover/emissive changes, not every frame
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
    const materialRef = useRef()
    const [hovered, setHovered] = useState(false)
    
    const registerBody = useCameraStore(state => state.registerBody)
    const unregisterBody = useCameraStore(state => state.unregisterBody)
    const trackedRef = useCameraStore(state => state.trackedRef)
    const setTrackedRef = useCameraStore(state => state.setTrackedRef)
    const stopTracking = useCameraStore(state => state.stopTracking)
    
    // Get emissive values from debug store (with fallbacks)
    const planetEmissive = useDebugStore(state => state.planetEmissive) ?? 1.5
    const moonEmissive = useDebugStore(state => state.moonEmissive) ?? 2.0
    
    const isPlanet = size >= SIZES.moon * 1.5
    const emissiveMultiplier = isPlanet ? planetEmissive : moonEmissive
    
    // Pre-computed color (memoized)
    const baseColor = useMemo(() => new THREE.Color(color), [color])
    const initialColor = useMemo(() => baseColor.clone().multiplyScalar(emissiveMultiplier), [baseColor, emissiveMultiplier])
    // Memoized offset for HudCallout (avoids array allocation on every render)
    const calloutOffset = useMemo(() => [size + 2, size, 0], [size])
    
    // Note: Color updates handled by FresnelGlowMaterial via props
    
    // Register body for navigation
    useEffect(() => {
        if (id && groupRef.current) {
            registerBody(id, groupRef, size)
        }
        return () => { if (id) unregisterBody(id) }
    }, [id, size, registerBody, unregisterBody])
    
    // Simple rotation - minimal useFrame work
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.1
        }
    })
    
    const handleClick = (e) => {
        e.stopPropagation()
        if (trackedRef?.current === groupRef.current) {
            // Re-click on same element = return to overview
            const returnToOverview = useCameraStore.getState().returnToOverview
            returnToOverview()
            onClick?.(null, null)
            return
        }
        setTrackedRef(groupRef, size, id)
        const worldPos = new THREE.Vector3()
        groupRef.current?.getWorldPosition(worldPos)
        onClick?.([worldPos.x, worldPos.y, worldPos.z], size)
    }
    
    return (
        <group ref={groupRef}>
            <mesh
                ref={meshRef}
                onClick={handleClick}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true) }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false) }}
            >
                <sphereGeometry args={[size, 32, 32]} />
                <FresnelGlowMaterial
                    ref={materialRef}
                    color={color}
                    intensity={hovered ? emissiveMultiplier * 0.9 : emissiveMultiplier * 0.6}
                    fresnelPower={isPlanet ? 3.0 : 3.5}
                    glowStrength={isPlanet ? 1.2 : 1.0}
                />
            </mesh>
            
            <HudReticle radius={size * 1.5} visible={hovered || trackedRef?.current === groupRef.current} />
            <HudCallout name={name} sectionId={id} visible={hovered || trackedRef?.current === groupRef.current} offset={calloutOffset} />
            
            {satellites.map((sat, index) => {
                const tiltX = (index * 37) % 90
                const tiltY = (index * 53) % 360
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
            
            {children}
        </group>
    )
}
