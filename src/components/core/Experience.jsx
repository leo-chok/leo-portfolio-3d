import { OrbitControls, Stars } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { SolarSystem } from '../3d/SolarSystem'
import { SpaceDust } from '../3d/SpaceDust'
import { CameraController } from './CameraController'
import { Effects } from './Effects'
import { useDebugStore } from '../../stores/debugStore'

export const Experience = ({ startAnimation = false }) => {
    // Get settings from debug store
    const starsCount = useDebugStore(state => state.starsCount)
    const dustCount = useDebugStore(state => state.dustCount)
    const showDebugPanel = useDebugStore(state => state.showDebugPanel)
    
    return (
        <>
            {/* FPS Counter - visible when debug panel is open (press D) */}
            {showDebugPanel && (
                <Perf 
                    position="bottom-left" 
                    minimal={true}
                />
            )}
            
            {/* Unified camera controller */}
            <CameraController startAnimation={startAnimation} />
            
            <OrbitControls 
                enableZoom={true} 
                enablePan={true} 
                makeDefault 
                autoRotate={false}
                autoRotateSpeed={0.3}
                target={[0, 0, 0]}
                maxDistance={90}
                minDistance={5}
                enableDamping={true}
                dampingFactor={0.05}
            />
            
            <ambientLight intensity={0.05} />
            <pointLight position={[10, 10, 10]} intensity={0.3} />
            
            {/* Stars with speed=0 to avoid continuous animation */}
            <Stars radius={100} depth={50} count={starsCount} factor={4} saturation={0} fade speed={0} />
            <SpaceDust count={dustCount} />
            
            <SolarSystem />

            <Effects />
        </>
    )
}
