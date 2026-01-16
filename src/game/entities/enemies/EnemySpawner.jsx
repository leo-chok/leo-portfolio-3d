import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../../stores/gameStore'
import { EnemyShip } from './EnemyShip'

/**
 * EnemySpawner - Wave-based enemy spawning system
 * 
 * Max 2 active at a time.
 * Wave N = N+1 total enemies.
 * 3 seconds delay after wave announcement before spawning.
 */
export const EnemySpawner = () => {
    const enemies = useGameStore(state => state.enemies)
    const currentWave = useGameStore(state => state.currentWave)
    const isWaveActive = useGameStore(state => state.isWaveActive)
    const nextWave = useGameStore(state => state.nextWave)
    const addEnemy = useGameStore(state => state.addEnemy)
    
    // Wave start announcement (handled by WaveAnnouncement component now)
    // We just need to handle the spawn delay
    
    const waveDelayRef = useRef(null)
    const spawnedCountRef = useRef(0)
    const totalEnemiesRef = useRef(0)
    const spawnActiveRef = useRef(false) // Gate spawning until delay over
    
    // Config
    const MAX_ACTIVE_ENEMIES = 2
    const SCENE_BOUNDS = {
        minX: -100, maxX: 100,
        minY: -100, maxY: 100,
        minZ: -100, maxZ: 100
    }
    
    // Start first wave (delayed to match chase music)
    useEffect(() => {
        const timer = setTimeout(() => {
            useGameStore.getState().startWave(1)
        }, 5000) // 5 seconds delay for dramatic effect
        return () => clearTimeout(timer)
    }, [])
    
    // Wave starts logic
    useEffect(() => {
        if (!isWaveActive || currentWave === 0) return
        
        spawnActiveRef.current = false // Wait for delay
        const totalEnemies = currentWave + 1
        totalEnemiesRef.current = totalEnemies
        spawnedCountRef.current = 0
        
        console.log(`[Wave ${currentWave}] Starting - ${totalEnemies} enemies total`)
        
        // 3 SECONDS DELAY before spawning enemies (to let announcement shine)
        const startTimer = setTimeout(() => {
            spawnActiveRef.current = true
            
            // Spawn initial batch
            const initialSpawn = Math.min(MAX_ACTIVE_ENEMIES, totalEnemies)
            for (let i = 0; i < initialSpawn; i++) {
                spawnEnemy(i * 500)
            }
        }, 3000)
        
        return () => clearTimeout(startTimer)
    }, [isWaveActive, currentWave])
    
    // Spawn replacements
    useEffect(() => {
        if (!isWaveActive || currentWave === 0 || !spawnActiveRef.current) return
        
        // Check if we need to spawn more
        const canSpawnMore = spawnedCountRef.current < totalEnemiesRef.current
        const hasRoom = enemies.length < MAX_ACTIVE_ENEMIES
        
        if (canSpawnMore && hasRoom) {
            spawnEnemy(300)
        }
        
        // Check wave complete
        if (spawnedCountRef.current >= totalEnemiesRef.current && enemies.length === 0) {
            console.log(`[Wave ${currentWave}] Complete!`)
            useGameStore.getState().completeWave()
        }
    }, [enemies.length, isWaveActive, currentWave])
    
    // Next wave logic
    useEffect(() => {
        if (enemies.length === 0 && !isWaveActive && currentWave > 0) {
            waveDelayRef.current = setTimeout(() => {
                nextWave()
            }, 3000)
        }
        return () => {
            if (waveDelayRef.current) clearTimeout(waveDelayRef.current)
        }
    }, [enemies.length, isWaveActive, currentWave, nextWave])
    
    const spawnEnemy = (delay = 0) => {
        setTimeout(() => {
            if (spawnedCountRef.current >= totalEnemiesRef.current) return
            
            const spawnPos = [
                SCENE_BOUNDS.minX + Math.random() * (SCENE_BOUNDS.maxX - SCENE_BOUNDS.minX),
                SCENE_BOUNDS.minY + Math.random() * (SCENE_BOUNDS.maxY - SCENE_BOUNDS.minY),
                SCENE_BOUNDS.minZ + Math.random() * (SCENE_BOUNDS.maxZ - SCENE_BOUNDS.minZ)
            ]
            
            addEnemy(spawnPos, 1)
            spawnedCountRef.current++
            console.log(`[Wave ${currentWave}] Spawned enemy ${spawnedCountRef.current}/${totalEnemiesRef.current}`)
        }, delay)
    }
    
    return (
        <>
            {enemies.map(enemy => (
                <EnemyShip
                    key={enemy.id}
                    id={enemy.id}
                    initialPosition={enemy.position}
                    health={enemy.health}
                />
            ))}
        </>
    )
}
