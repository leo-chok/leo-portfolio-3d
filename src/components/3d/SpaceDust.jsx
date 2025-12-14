import { useRef, useMemo } from 'react'
import * as THREE from 'three'

// Pre-computed color (outside component = zero allocations)
const DUST_COLOR = new THREE.Color('#7cc4ed').multiplyScalar(2)

export const SpaceDust = ({ count = 6000 }) => {
  const mesh = useRef()

  // Generate random positions in a SPHERE (not cube)
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3)
    const radius = 160 // Match Stars radius
    
    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * Math.cbrt(Math.random()) // cbrt for uniform volume distribution
      
      temp[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      temp[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      temp[i * 3 + 2] = r * Math.cos(phi)
    }
    return temp
  }, [count])

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={DUST_COLOR}
        sizeAttenuation={true}
        transparent
        opacity={0.4}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  )
}
