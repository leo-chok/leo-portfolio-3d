import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { INTENSITY } from '../../../config/galaxyConfig'
import { HudReticle } from '../hud3d/HudReticle'
import { HudCallout } from '../hud3d/HudCallout'
import { SunFresnelMaterial } from '../materials/SunFresnelMaterial'
import { GlowHalo } from '../materials/GlowHalo'
import { SolarCorona } from '../materials/SolarCorona'
import { useCameraStore } from '../../../stores/cameraStore'
import { useDebugStore, hueToColor } from '../../../stores/debugStore'

/**
 * Sun Component - Dynamic star with corona, flares, and halos
 * Features:
 * - Fresnel rim light core
 * - Animated corona shader (fire ring)
 * - Particle ejections (solar flares)
 * - Rotating dynamic halos
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
    
    // Dynamic color from HUE
    const color = useMemo(() => hueToColor(sunHue, 80, 65), [sunHue])
    
    // Corona/flare color (more orange/red)
    const flareColor = useMemo(() => hueToColor(sunHue - 10, 90, 55), [sunHue])
    
    // Memoized offset for HudCallout
    const calloutOffset = useMemo(() => [size * 0.25 + 0.3, size * 0.15, 0], [size])
    
    // Register body
    useEffect(() => {
        if (groupRef.current) {
            registerBody(id, groupRef, size)
        }
        return () => unregisterBody(id)
    }, [id, size, registerBody, unregisterBody])
    
    // Load sun texture
    const sunTexture = useTexture('/sun_texture.jpg')
    
    // Slow rotation for dynamic effect
    useFrame((state, delta) => {
        if (coreRef.current) {
            coreRef.current.rotation.y += delta * 0.02 // Slow rotation
        }
    })
    
    const handleClick = (e) => {
        e.stopPropagation()
        if (trackedRef?.current === groupRef.current) {
            const returnToOverview = useCameraStore.getState().returnToOverview
            returnToOverview()
            onClick?.(null, null)
            return
        }
        setTrackedRef(groupRef, size, id)
        onClick?.(position, size)
    }
    
    return (
        <group ref={groupRef} position={position}>
            {/* Background glow halo - sprite based */}
            <GlowHalo 
                color={color}
                size={size * 3}
                opacity={0.5}
                layers={2}
            />
            
            {/* SOLID textured sun surface - renders first (renderOrder=0), blocks objects behind */}
            <mesh 
                ref={coreRef}
                renderOrder={0}
                onClick={handleClick}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true) }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false) }}
            >
                <sphereGeometry args={[size * 0.59, 64, 48]} />
                <meshBasicMaterial
                    map={sunTexture}
                    toneMapped={false}
                />
            </mesh>
            
            {/* Fresnel rim light - transparent overlay (renderOrder=1) */}
            <mesh renderOrder={1}>
                <sphereGeometry args={[size * 0.6, 48, 48]} />
                <SunFresnelMaterial
                    ref={materialRef}
                    color="#ff8800"
                    glowColor="#ff5900"
                    intensity={hovered ? 50 : 5}
                    fresnelPower={1.5}
                    glowStrength={4}
                />
            </mesh>
            
            {/* Animated corona shader - outermost glow, extends beyond texture */}
            <SolarCorona 
                size={size * 0.55}
                color={flareColor}
                intensity={0.7}
            />
            
            <pointLight color={color} intensity={intensity} distance={300} decay={1.5} />
            
            <HudReticle 
                radius={size * 0.6 * 1.3} 
                visible={hovered || trackedRef?.current === groupRef.current} 
                isTracked={trackedRef?.current === groupRef.current}
            />
            <HudCallout 
                name={name} 
                sectionId={id} 
                visible={hovered || trackedRef?.current === groupRef.current} 
                isTracked={trackedRef?.current === groupRef.current}
                offset={calloutOffset}
                classification="STAR"
            />
        </group>
    )
}
