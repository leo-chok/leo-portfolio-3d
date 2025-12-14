import { useRef } from 'react'
import { OrbitControls, Stars } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { SolarSystem } from '../3d/SolarSystem'
import { SpaceDust } from '../3d/SpaceDust'
import { SpaceshipController } from '../3d/SpaceshipController'
import { BarrierEffect } from '../3d/BarrierEffect'
import { CameraController } from './CameraController'
import { Effects } from './Effects'
import { useDebugStore } from '../../stores/debugStore'
import { useSpaceshipStore } from '../../stores/spaceshipStore'

export const Experience = ({ startAnimation = false }) => {
    // Get settings from debug store
    const starsCount = useDebugStore(state => state.starsCount)
    const dustCount = useDebugStore(state => state.dustCount)
    const showDebugPanel = useDebugStore(state => state.showDebugPanel)
    
    // Spaceship mode
    const isSpaceshipMode = useSpaceshipStore(state => state.isSpaceshipMode)
    const shipRef = useRef()
    
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
            <CameraController startAnimation={startAnimation} shipRef={shipRef} />
            
            <OrbitControls 
                enableZoom={true} 
                enablePan={true} 
                makeDefault 
                autoRotate={false}
                autoRotateSpeed={0.1}
                target={[0, 0, 0]}
                maxDistance={150}
                minDistance={5}
                enableDamping={true}
                dampingFactor={0.05}
            />
            
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            
            {/* Stars with speed=0 to avoid continuous animation */}
            <Stars radius={100} depth={50} count={starsCount} factor={4} saturation={0} fade speed={0} />
            <SpaceDust count={dustCount} />
            
            <SolarSystem />
            
            {/* Spaceship mode components */}
            {isSpaceshipMode && (
                <>
                    <SpaceshipController ref={shipRef} />
                    {/* Barrier in WORLD space - at radius 150 on Soleil→Vaisseau axis */}
                    <BarrierEffect />
                </>
            )}

            <Effects />
        </>
    )
}
