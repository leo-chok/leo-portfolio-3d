import { useRef } from 'react'
import { OrbitControls, Stars } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { 
    SolarSystem, 
    SpaceDust, 
    MilkyWay, 
    Mothership,
    Nebula 
} from '../3d'
import { SpaceshipController, BarrierEffect, CollisionSystem, ProjectileRenderer, EnemySpawner } from '../../game'
import { CameraController } from './CameraController'
import { Effects } from './Effects'
import { useDebugStore } from '../../stores/debugStore'
import { useSpaceshipStore } from '../../stores/spaceshipStore'

export const Experience = ({ startAnimation = false, onIntroComplete }) => {
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
            <CameraController startAnimation={startAnimation} shipRef={shipRef} onIntroComplete={onIntroComplete} />
            
            <OrbitControls 
                enableZoom={true} 
                enablePan={true} 
                makeDefault 
                autoRotate={false}
                autoRotateSpeed={0.04}
                target={[0, 0, 0]}
                maxDistance={300}
                minDistance={5}
                enableDamping={true}
                dampingFactor={0.05}
            />
            
            <pointLight position={[0, 0, 0]} intensity={15000} />
            
            {/* Background stars */}
            <Stars radius={250} depth={300} count={starsCount} factor={10} saturation={0} fade speed={0} />
            
            {/* Milky Way disk - tilted galactic plane */}
            <MilkyWay />
            
            {/* Nebula clouds in background */}
            <Nebula />
            
            <SpaceDust count={dustCount} />
            
            <SolarSystem />
            
            {/* Autonomous cargo ship NPC */}
            <Mothership />
            
            {/* Spaceship mode components */}
            {isSpaceshipMode && (
                <>
                    <SpaceshipController ref={shipRef} />
                    {/* Centralized collision detection */}
                    <CollisionSystem shipRef={shipRef} />
                    {/* Centralized projectile and explosion rendering */}
                    <ProjectileRenderer />
                    {/* Enemy wave spawner */}
                    <EnemySpawner />
                    {/* Barrier in WORLD space - at radius 150 on Soleil→Vaisseau axis */}
                    <BarrierEffect />
                </>
            )}

            <Effects />
        </>
    )
}
