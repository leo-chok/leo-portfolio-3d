import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { HudReticle } from '../hud3d/HudReticle'
import { HudCallout } from '../hud3d/HudCallout'
import { useCameraStore } from '../../../stores/cameraStore'
import { useAudioStore } from '../../../stores/audioStore'

/**
 * MoonTom Component - Custom moon using TheMoon.glb model
 * Orbits around the Formation planet
 */
export const MoonTom = ({ 
    id = 'moon-tom',
    name = 'TOM', 
    size = 0.8,
    rotationSpeed = 0.05,
}) => {
    const groupRef = useRef()
    const modelRef = useRef()
    const [hovered, setHovered] = useState(false)
    
    // Load the 3D model
    const { scene } = useGLTF('/TheMoon.glb')
    
    // Clone the scene and compute center offset for proper positioning
    const { clonedScene, centerOffset } = useMemo(() => {
        const clone = scene.clone()
        
        // Compute bounding box to find center offset
        const box = new THREE.Box3().setFromObject(clone)
        const center = box.getCenter(new THREE.Vector3())
        
        // Traverse and setup materials + shadows
        clone.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
                // Enhance the material with some emissive glow
                if (child.material) {
                    child.material = child.material.clone()
                    child.material.emissive = new THREE.Color('#444466')
                    child.material.emissiveIntensity = 0.1
                }
            }
        })
        
        return { 
            clonedScene: clone, 
            centerOffset: [-center.x, -center.y, -center.z] 
        }
    }, [scene])
    
    // Camera store hooks
    const registerBody = useCameraStore(state => state.registerBody)
    const unregisterBody = useCameraStore(state => state.unregisterBody)
    const trackedRef = useCameraStore(state => state.trackedRef)
    const setTrackedRef = useCameraStore(state => state.setTrackedRef)
    
    // Register body for navigation
    useEffect(() => {
        if (id && groupRef.current) {
            registerBody(id, groupRef, size, null)
        }
        return () => { if (id) unregisterBody(id) }
    }, [id, size, registerBody, unregisterBody])
    
    // Rotation animation
    useFrame((state, delta) => {
        if (modelRef.current) {
            modelRef.current.rotation.y += delta * rotationSpeed
        }
    })
    
    const handleClick = (e) => {
        e.stopPropagation()
        if (trackedRef?.current === groupRef.current) {
            // Re-click on same element = return to overview
            const returnToOverview = useCameraStore.getState().returnToOverview
            returnToOverview()
            return
        }
        // Play planet click sound
        useAudioStore.getState().playPlanetClick()
        setTrackedRef(groupRef, size, id, null)
    }
    
    // HUD offset for callout
    const calloutOffset = useMemo(() => [size * 0.8 + 0.5, size * 0.4, 0], [size])
    
    return (
        <group ref={groupRef}>
            {/* The 3D Moon Model */}
            <group 
                ref={modelRef}
                scale={[size * 0.5, size * 0.5, size * 0.5]}
                onClick={handleClick}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true) }}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false) }}
            >
                {/* Apply center offset to properly position the model at origin */}
                <group position={centerOffset}>
                    <primitive object={clonedScene} />
                </group>
            </group>
            
            {/* HUD Elements */}
            <HudReticle 
                radius={size * 1.2} 
                visible={hovered || trackedRef?.current === groupRef.current} 
                isTracked={trackedRef?.current === groupRef.current}
            />
            <HudCallout 
                name={name} 
                sectionId={id} 
                visible={hovered || trackedRef?.current === groupRef.current} 
                isTracked={trackedRef?.current === groupRef.current}
                offset={calloutOffset}
                classification={'MOON'}
            />
        </group>
    )
}

// Preload the model
useGLTF.preload('/TheMoon.glb')
