import { useRef, useMemo } from 'react'
import * as THREE from 'three'

// Pre-computed color (outside component = zero allocations)
const DUST_COLOR = new THREE.Color('#7cc4ed').multiplyScalar(2)

export const SpaceDust = ({ count = 2000 }) => {
  const mesh = useRef()
  
  // Generate random positions (memoized)
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 200
      temp[i * 3 + 1] = (Math.random() - 0.5) * 200
      temp[i * 3 + 2] = (Math.random() - 0.5) * 200
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
