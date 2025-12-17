import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { INTENSITY } from '../../../config/galaxyConfig'
import { HudReticle } from '../hud3d/HudReticle'
import { HudCallout } from '../hud3d/HudCallout'
import { FresnelGlowMaterial } from '../materials/FresnelGlowMaterial'
import { GlowHalo } from '../materials/GlowHalo'
import { useCameraStore } from '../../../stores/cameraStore'
import { useDebugStore, hueToColor } from '../../../stores/debugStore'

/**
 * Sun Component - HYBRID: Fresnel rim light + Halo sprite
 * Color and size controlled by debug store
 */
export const Sun = ({ id = 'presentation', name, position = [0, 0, 0], onClick }) => {
    const groupRef = useRef()
    const coreRef = useRef()
    const materialRef = useRef()
    const [hovered, setHovered] = useState(false)
    
    // Get sun values from debug store
    const sunData = useDebugStore(state => state.sun)
    const size = sunData?.size || 8
    const sunHue = sunData?.hue || 40
    
    const intensity = INTENSITY.sun
    
    const registerBody = useCameraStore(state => state.registerBody)
    const unregisterBody = useCameraStore(state => state.unregisterBody)
    const trackedRef = useCameraStore(state => state.trackedRef)
    const setTrackedRef = useCameraStore(state => state.setTrackedRef)
    const stopTracking = useCameraStore(state => state.stopTracking)
    
    // Dynamic color from HUE
    const color = useMemo(() => hueToColor(sunHue, 80, 65), [sunHue])
    
    // Memoized offset for HudCallout
    // Closer to sun radius (size * 0.6)
    const calloutOffset = useMemo(() => [size * 0.6 + 0.8, size * 0.3, 0], [size])
    
    // Register body
    useEffect(() => {
        if (groupRef.current) {
            registerBody(id, groupRef, size)
        }
        return () => unregisterBody(id)
    }, [id, size, registerBody, unregisterBody])
    
    // Minimal useFrame - just subtle pulse
    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        if (coreRef.current) {
            const pulse = 1 + Math.sin(time * 0.3) * 0.03
            coreRef.current.scale.setScalar(pulse)
        }
    })
    
    const handleClick = (e) => {
        e.stopPropagation()
        if (trackedRef?.current === groupRef.current) {
            stopTracking()
            onClick?.(null, null)
            return
        }
        setTrackedRef(groupRef, size, id)
        onClick?.(position, size)
    }
    
    return (
        <group ref={groupRef} position={position}>
            {/* Halo glow behind the sun - sprite based */}
            <GlowHalo 
                color={color}
                size={size * 2.5}
                opacity={0.5}
                layers={3}
            />
            
            {/* Core with Fresnel rim light */}
            <mesh 
                ref={coreRef}
                onClick={handleClick}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true) }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false) }}
            >
                <sphereGeometry args={[size * 0.6, 48, 48]} />
                <FresnelGlowMaterial
                    ref={materialRef}
                    color={color}
                    glowColor="#ffffff"
                    intensity={hovered ? 1.2 : 1}
                    fresnelPower={1.5}
                    glowStrength={1.0}
                />
            </mesh>
            
            <pointLight color={color} intensity={intensity} distance={200} decay={1.5} />
            
            <HudReticle 
                radius={size * 0.6 * 1.3} 
                visible={hovered || trackedRef?.current === groupRef.current} 
                isTracked={trackedRef?.current === groupRef.current}
            />
            <HudCallout 
                name={name} 
                sectionId={id} 
                visible={hovered || trackedRef?.current === groupRef.current} 
                offset={calloutOffset}
                classification="STAR"
            />
        </group>
    )
}
