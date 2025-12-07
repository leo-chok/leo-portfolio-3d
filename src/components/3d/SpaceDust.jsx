import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const SpaceDust = ({ count = 2000 }) => {
  const mesh = useRef()
  
  // Generate random positions and slight drift velocities
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 200 // Wide spread
      const y = (Math.random() - 0.5) * 200
      const z = (Math.random() - 0.5) * 200
      temp[i * 3] = x
      temp[i * 3 + 1] = y
      temp[i * 3 + 2] = z
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
        color={new THREE.Color('#7cc4ed').multiplyScalar(2)}
        sizeAttenuation={true}
        transparent
        opacity={0.4}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  )
}
