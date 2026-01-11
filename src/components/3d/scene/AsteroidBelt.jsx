import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useAsteroidStore } from '../../../stores/asteroidStore'

/**
 * AsteroidBelt - Instanced rendering of ~500 asteroids
 * Belt between radius 70-100, thickness 30 (vertical)
 * Each asteroid has random size, rotation axis, and rotation speed
 */

// Configuration
const ASTEROID_COUNT = 300
const INNER_RADIUS = 98
const OUTER_RADIUS = 105
const BELT_THICKNESS = 2 // Vertical spread

export const AsteroidBelt = ({ 
    asteroidPath = '/asteroid.glb',
    color = '#151616ff'
}) => {
    const meshRef = useRef()
    const { nodes } = useGLTF(asteroidPath)
    
    // Find the first mesh in the GLB and clone it
    const asteroidGeometry = useMemo(() => {
        // Get the first mesh geometry from the GLB
        for (const key of Object.keys(nodes)) {
            if (nodes[key].geometry) {
                // Clone to avoid shared geometry issues
                return nodes[key].geometry.clone()
            }
        }
        // Fallback to icosahedron if no geometry found
        return new THREE.IcosahedronGeometry(0.5, 1)
    }, [nodes])
    
    // Generate asteroid data (positions, scales, rotation axes, speeds)
    const asteroidData = useMemo(() => {
        const data = []
        
        // Gaussian random function (Box-Muller transform)
        const gaussianRandom = () => {
            const u1 = Math.random()
            const u2 = Math.random()
            return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
        }
        
        const centerRadius = (INNER_RADIUS + OUTER_RADIUS) / 2
        const radiusSpread = (OUTER_RADIUS - INNER_RADIUS) / 4 // Standard deviation
        
        for (let i = 0; i < ASTEROID_COUNT; i++) {
            // Random position in ring - gaussian distribution centered on middle
            const angle = Math.random() * Math.PI * 2
            
            // Gaussian radius - denser in center, sparser at edges
            let radius = centerRadius + gaussianRandom() * radiusSpread
            // Clamp to belt bounds
            radius = Math.max(INNER_RADIUS, Math.min(OUTER_RADIUS, radius))
            
            // Gaussian height - denser in plane, sparser vertically
            const height = gaussianRandom() * (BELT_THICKNESS / 4)
            
            const position = new THREE.Vector3(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            )
            
            // Random scale (much smaller: 0.1 - 0.4)
            const scale = 0.1 + Math.random() * 0.1
            
            // Random rotation axis (normalized)
            const rotationAxis = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5
            ).normalize()
            
            // Random rotation speed (very slow: 0.05 - 0.3 rad/s)
            const rotationSpeed = 0.05 + Math.random() * 0.25
            
            // Initial random rotation as quaternion (mutable for animation)
            const quaternion = new THREE.Quaternion()
            quaternion.setFromEuler(new THREE.Euler(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            ))
            
            data.push({
                position,
                scale,
                rotationAxis,
                rotationSpeed,
                quaternion, // Mutable quaternion for animation
                // For collision: store radius based on scale
                collisionRadius: scale * 0.8
            })
        }
        
        return data
    }, [])
    
    // Register asteroid data in store for collision detection
    useEffect(() => {
        const { setAsteroids, setBeltConfig } = useAsteroidStore.getState()
        setBeltConfig(INNER_RADIUS, OUTER_RADIUS, BELT_THICKNESS)
        setAsteroids(asteroidData)
        
        return () => setAsteroids([]) // Cleanup on unmount
    }, [asteroidData])
    
    // Create material
    const material = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.6,
            metalness: 0.2,
            flatShading: true
        })
    }, [color])
    
    // Initialize instance matrices
    useEffect(() => {
        if (!meshRef.current) return
        
        const dummy = new THREE.Object3D()
        
        asteroidData.forEach((asteroid, i) => {
            dummy.position.copy(asteroid.position)
            dummy.quaternion.copy(asteroid.quaternion)
            dummy.scale.setScalar(asteroid.scale)
            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        })
        
        meshRef.current.instanceMatrix.needsUpdate = true
    }, [asteroidData])
    
    // Animate rotations - update quaternions stored in asteroidData
    useFrame((state, delta) => {
        if (!meshRef.current) return
        
        const dummy = new THREE.Object3D()
        const rotQuat = new THREE.Quaternion()
        
        asteroidData.forEach((asteroid, i) => {
            // Create rotation increment around random axis
            rotQuat.setFromAxisAngle(
                asteroid.rotationAxis,
                asteroid.rotationSpeed * delta
            )
            
            // Apply rotation to stored quaternion
            asteroid.quaternion.premultiply(rotQuat)
            
            // Build matrix from stored data
            dummy.position.copy(asteroid.position)
            dummy.quaternion.copy(asteroid.quaternion)
            dummy.scale.setScalar(asteroid.scale)
            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        })
        
        meshRef.current.instanceMatrix.needsUpdate = true
    })
    
    return (
        <instancedMesh
            ref={meshRef}
            args={[asteroidGeometry, material, ASTEROID_COUNT]}
            frustumCulled={false}
        />
    )
}

// Preload the asteroid model
useGLTF.preload('/8_low_poly_asteroids.glb')

// Export asteroid data for collision system
export const getAsteroidBeltConfig = () => ({
    innerRadius: INNER_RADIUS,
    outerRadius: OUTER_RADIUS,
    thickness: BELT_THICKNESS,
    count: ASTEROID_COUNT
})
