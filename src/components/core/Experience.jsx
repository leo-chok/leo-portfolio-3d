import { OrbitControls, Stars } from '@react-three/drei'
import { SolarSystem } from '../3d/SolarSystem'
import { SpaceDust } from '../3d/SpaceDust'
import { CameraController } from './CameraController'
import { Effects } from './Effects'

export const Experience = () => {
    return (
        <>
            <OrbitControls 
                enableZoom={true} 
                enablePan={true} 
                makeDefault 
                autoRotate={true}
                autoRotateSpeed={0.3}
                target={[0, 0, 0]}
                maxDistance={90}
                minDistance={5}
                enableDamping={true}
                dampingFactor={0.05}
                minAzimuthAngle={-Infinity}
                maxAzimuthAngle={Infinity}
            />
            
            {/* Camera tracking controller */}
            <CameraController />
            
            <ambientLight intensity={0.05} />
            <pointLight position={[10, 10, 10]} intensity={0.3} />
            
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <SpaceDust count={5000} />
            
            <SolarSystem />

            {/* Custom Bloom Post-Processing - connected to debug panel */}
            <Effects />
        </>
    )
}

