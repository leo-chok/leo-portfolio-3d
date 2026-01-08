import { useRef, useEffect } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { LaserBolt, ExplosionEffect } from '../entities/effects'

/**
 * ProjectileRenderer - Centralized rendering of projectiles and effects
 * 
 * Renders all lasers and explosions from gameStore.
 * Registers laser refs for collision detection.
 */
export const ProjectileRenderer = () => {
    const lasers = useGameStore(state => state.lasers)
    const explosions = useGameStore(state => state.explosions)
    const removeExplosion = useGameStore(state => state.removeExplosion)
    
    return (
        <>
            {/* Render all lasers */}
            {lasers.map(laser => (
                <LaserBoltWithRef
                    key={laser.id}
                    laser={laser}
                />
            ))}
            
            {/* Render all explosions */}
            {explosions.map(exp => (
                <ExplosionEffect
                    key={exp.id}
                    position={exp.position}
                    scale={exp.scale}
                    onComplete={() => removeExplosion(exp.id)}
                />
            ))}
        </>
    )
}

/**
 * LaserBoltWithRef - Wrapper to register ref for collision detection
 * The ref tracks the moving laser position for collision checks
 */
const LaserBoltWithRef = ({ laser }) => {
    const laserRef = useRef()
    
    // Register/unregister ref for collision detection
    useEffect(() => {
        // Wait a tick for the ref to be populated
        const timer = setTimeout(() => {
            if (laserRef.current) {
                // Store the ref object itself (not .current) so we can access .current later
                useGameStore.getState().registerLaserRef(laser.id, { current: laserRef.current })
            }
        }, 0)
        
        return () => {
            clearTimeout(timer)
            useGameStore.getState().unregisterLaserRef(laser.id)
        }
    }, [laser.id])
    
    // Handle laser expiration
    const handleComplete = () => {
        useGameStore.getState().removeLaser(laser.id)
    }
    
    return (
        <LaserBolt
            ref={laserRef}
            startPosition={laser.startPosition}
            direction={laser.direction}
            owner={laser.owner || 'player'}
            speed={laser.speed || 80}
            lifetime={laser.lifetime || 3}
            onComplete={handleComplete}
        />
    )
}
