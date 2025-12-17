import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSpaceshipStore } from '../../../stores/spaceshipStore'

// Pre-allocated vectors for performance
const _shipPos = new THREE.Vector3()
const _barrierPos = new THREE.Vector3()
const _lookTarget = new THREE.Vector3()

/**
 * BarrierEffect - Blue force field at the boundary
 * Positioned in WORLD SPACE at radius 150, on the axis Soleil→Vaisseau
 * Appears when ship gets close to the boundary
 */
export const BarrierEffect = () => {
    const groupRef = useRef()
    const materialRef = useRef()
    const outerMaterialRef = useRef()
    const currentOpacity = useRef(0)
    
    // Get ship position and barrier intensity from store
    const position = useSpaceshipStore(state => state.position)
    const barrierIntensity = useSpaceshipStore(state => state.barrierIntensity)
    
    // Barrier appears at this radius
    const BARRIER_RADIUS = 150
    
    // Create radial gradient texture
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const ctx = canvas.getContext('2d')
        
        // Radial gradient - bright center fading to transparent
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)')
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)')
        gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.1)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 256, 256)
        
        const tex = new THREE.CanvasTexture(canvas)
        tex.needsUpdate = true
        return tex
    }, [])
    
    // Position barrier in WORLD SPACE at radius 150 on the Soleil→Vaisseau axis
    useFrame(() => {
        if (!groupRef.current) return
        
        // Get ship world position
        _shipPos.set(position.x, position.y, position.z)
        
        // Calculate barrier position: normalize(shipPos) * BARRIER_RADIUS
        // This places it at radius 150, on the axis between center and ship
        const shipDistance = _shipPos.length()
        if (shipDistance < 0.1) return // Avoid division by zero
        
        _barrierPos.copy(_shipPos).normalize().multiplyScalar(BARRIER_RADIUS)
        groupRef.current.position.copy(_barrierPos)
        
        // Make the barrier face the center (tangent to the boundary sphere)
        _lookTarget.set(0, 0, 0) // Look at center
        groupRef.current.lookAt(_lookTarget)
        
        // Update opacity - bright barrier effect
        if (materialRef.current) {
            const targetOpacity = barrierIntensity * 0.9
            currentOpacity.current += (targetOpacity - currentOpacity.current) * 0.15
            materialRef.current.opacity = currentOpacity.current
        }
        if (outerMaterialRef.current) {
            outerMaterialRef.current.opacity = currentOpacity.current * 0.5
        }
    })
    
    // Don't render if very low intensity
    if (barrierIntensity <= 0.01) return null
    
    return (
        <group ref={groupRef}>
            {/* Main barrier glow */}
            <mesh>
                <planeGeometry args={[15, 15]} />
                <meshBasicMaterial
                    ref={materialRef}
                    map={texture}
                    color="#66ccff"
                    transparent
                    opacity={0}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                    toneMapped={false}
                />
            </mesh>
            {/* Outer glow layer */}
            <mesh>
                <planeGeometry args={[25, 25]} />
                <meshBasicMaterial
                    ref={outerMaterialRef}
                    map={texture}
                    color="#44aaff"
                    transparent
                    opacity={0}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                    toneMapped={false}
                />
            </mesh>
        </group>
    )
}
