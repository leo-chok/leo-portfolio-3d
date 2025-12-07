import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { COLORS } from '../../config/galaxyConfig'

/**
 * OrbitRing Component - Visual representation of orbital path
 */
export const OrbitRing = ({ radius, color = COLORS.hud }) => {
    return (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius - 0.03, radius + 0.03, 128]} />
            <meshBasicMaterial 
                color={color}
                transparent
                opacity={0.2}
                side={THREE.DoubleSide}
                toneMapped={false}
            />
        </mesh>
    )
}

/**
 * OrbitingBody Component - Base for any orbiting object (planet, moon, satellite)
 * Uses group rotation for tilted orbital planes - ensures body stays on ring
 */
export const OrbitingBody = ({ 
    children, 
    orbitRadius = 10, 
    orbitSpeed = 0.1, 
    orbitPlane = { tilt: 0, rotation: 0 },
    initialAngle = 0,
    showOrbitRing = true 
}) => {
    // This group handles the orbital plane tilt
    const planeRef = useRef()
    // This group rotates around the tilted plane (the actual orbit)
    const orbitRef = useRef()
    // This holds the orbiting body at fixed radius
    const bodyRef = useRef()
    
    const orbitAngle = useRef(initialAngle)
    
    useFrame((state, delta) => {
        if (orbitRef.current) {
            // Simply rotate the orbit group around Y axis
            // The body is positioned at [orbitRadius, 0, 0], so rotation = orbit
            orbitAngle.current += orbitSpeed * delta
            orbitRef.current.rotation.y = orbitAngle.current
        }
    })
    
    // Convert plane angles to radians
    const tiltRad = THREE.MathUtils.degToRad(orbitPlane.tilt)
    const rotationRad = THREE.MathUtils.degToRad(orbitPlane.rotation)
    
    return (
        <>
            {/* Orbital plane group - tilted */}
            <group 
                ref={planeRef} 
                rotation={[tiltRad, rotationRad, 0]}
            >
                {/* Orbit ring sits on this tilted plane */}
                {showOrbitRing && <OrbitRing radius={orbitRadius} />}
                
                {/* Orbit rotation group */}
                <group ref={orbitRef}>
                    {/* Body positioned at radius on X axis */}
                    <group ref={bodyRef} position={[orbitRadius, 0, 0]}>
                        {children}
                    </group>
                </group>
            </group>
        </>
    )
}
