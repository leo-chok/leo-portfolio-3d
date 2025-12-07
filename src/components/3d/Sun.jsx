import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Billboard } from '@react-three/drei'
import { COLORS, SIZES, INTENSITY } from '../../config/galaxyConfig'
import { HudReticle } from './HudReticle'
import { HudCallout } from './HudCallout'
import { useCameraStore } from '../../stores/cameraStore'
import { useDebugStore } from '../../stores/debugStore'

/**
 * Sun Component - Central "Présentation" star
 * The brightest and largest element in the system
 */
export const Sun = ({ id = 'presentation', name, position = [0, 0, 0], onClick }) => {
    const groupRef = useRef()
    const coreRef = useRef()
    const glowRef = useRef()
    const materialRef = useRef()
    const [hovered, setHovered] = useState(false)
    
    const size = SIZES.sun
    const color = COLORS.sun
    const intensity = INTENSITY.sun
    
    const registerBody = useCameraStore((state) => state.registerBody)
    const unregisterBody = useCameraStore((state) => state.unregisterBody)
    const trackedRef = useCameraStore((state) => state.trackedRef)
    const setTrackedRef = useCameraStore((state) => state.setTrackedRef)
    const stopTracking = useCameraStore((state) => state.stopTracking)
    const sunEmissive = useDebugStore((state) => state.sunEmissive)
    
    // Base color for the sun
    const baseColor = useMemo(() => new THREE.Color(color), [color])
    
    // Register this body with the camera store for navigation
    useEffect(() => {
        if (groupRef.current) {
            registerBody(id, groupRef, size)
        }
        return () => unregisterBody(id)
    }, [id, size, registerBody, unregisterBody])
    
    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        
        // Very subtle pulsing core
        if (coreRef.current) {
            const pulse = 1 + Math.sin(time * 0.3) * 0.03
            coreRef.current.scale.set(pulse, pulse, pulse)
        }
        
        // Update material emissive from debug store
        if (materialRef.current) {
            materialRef.current.color.copy(baseColor).multiplyScalar(sunEmissive)
        }
        
        // Outer glow rotation
        if (glowRef.current) {
            glowRef.current.rotation.y = time * 0.1
            glowRef.current.rotation.z = time * 0.05
        }
    })
    
    const handleClick = (e) => {
        e.stopPropagation()
        
        // Toggle tracking logic
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
            {/* Inner Core - Brightest */}
            <mesh 
                ref={coreRef}
                onClick={handleClick}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true) }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false) }}
            >
                <sphereGeometry args={[size * 0.6, 64, 64]} />
                <meshBasicMaterial 
                    ref={materialRef}
                    color={baseColor.clone().multiplyScalar(sunEmissive)} 
                    toneMapped={false}
                />
            </mesh>
            
            {/* Point Light for scene illumination */}
            <pointLight 
                color={color} 
                intensity={intensity * 1} 
                distance={200} 
                decay={1.5} 
            />
            
            {/* HUD Elements - visible on hover OR when being tracked */}
            <HudReticle radius={size * 0.6 * 1.3} visible={hovered || trackedRef?.current === groupRef.current} />
            <HudCallout name={name} visible={hovered || trackedRef?.current === groupRef.current} offset={[size * 0.6 + 1.5, size * 0.6, 0]} />
        </group>
    )
}
