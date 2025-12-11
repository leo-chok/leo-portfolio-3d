import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS, SIZES, INTENSITY } from '../../config/galaxyConfig'
import { HudReticle } from './HudReticle'
import { HudCallout } from './HudCallout'
import { useCameraStore } from '../../stores/cameraStore'
import { useDebugStore } from '../../stores/debugStore'

/**
 * Sun Component - Optimized for performance
 * Color/scale updates only when necessary, not every frame
 */
export const Sun = ({ id = 'presentation', name, position = [0, 0, 0], onClick }) => {
    const groupRef = useRef()
    const coreRef = useRef()
    const materialRef = useRef()
    const [hovered, setHovered] = useState(false)
    
    const size = SIZES.sun
    const color = COLORS.sun
    const intensity = INTENSITY.sun
    
    const registerBody = useCameraStore(state => state.registerBody)
    const unregisterBody = useCameraStore(state => state.unregisterBody)
    const trackedRef = useCameraStore(state => state.trackedRef)
    const setTrackedRef = useCameraStore(state => state.setTrackedRef)
    const stopTracking = useCameraStore(state => state.stopTracking)
    const sunEmissive = useDebugStore(state => state.sunEmissive)
    
    const baseColor = useMemo(() => new THREE.Color(color), [color])
    // Memoized initial color for JSX (avoids .clone() on every render)
    const initialColor = useMemo(() => baseColor.clone().multiplyScalar(sunEmissive), [baseColor, sunEmissive])
    // Memoized offset for HudCallout (avoids array allocation on every render)
    const calloutOffset = useMemo(() => [size * 0.6 + 1.5, size * 0.6, 0], [size])
    
    // Update color only when emissive changes
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.color.copy(baseColor).multiplyScalar(sunEmissive)
        }
    }, [sunEmissive, baseColor])
    
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
            <mesh 
                ref={coreRef}
                onClick={handleClick}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true) }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false) }}
            >
                <sphereGeometry args={[size * 0.6, 48, 48]} />
                <meshBasicMaterial 
                    ref={materialRef}
                    color={initialColor} 
                    toneMapped={false}
                />
            </mesh>
            
            <pointLight color={color} intensity={intensity} distance={200} decay={1.5} />
            
            <HudReticle radius={size * 0.6 * 1.3} visible={hovered || trackedRef?.current === groupRef.current} />
            <HudCallout name={name} visible={hovered || trackedRef?.current === groupRef.current} offset={calloutOffset} />
        </group>
    )
}
