import { create } from 'zustand'
import { useAudioStore } from './audioStore'

/**
 * Game Store - Centralized state for game entities and systems
 * 
 * Manages:
 * - Lasers: player and enemy projectiles
 * - Explosions: impact and destruction effects
 * - Enemies: enemy ships with refs for collision
 * - Score: points and high score
 * - Waves: wave-based enemy spawning
 */

let laserIdCounter = 0
let explosionIdCounter = 0
let enemyIdCounter = 0

export const useGameStore = create((set, get) => ({
    // === LASERS ===
    lasers: [],
    laserRefs: {},
    
    // === AUTO-AIM ===
    // Direction towards targeted enemy (null if no target)
    autoAimTarget: null, // { direction: THREE.Vector3, enemyId: number }
    
    setAutoAimTarget: (target) => set({ autoAimTarget: target }),
    
    addLaser: (data) => {
        const id = ++laserIdCounter
        const laser = { ...data, id }
        set(state => ({
            lasers: [...state.lasers, laser]
        }))
        return id
    },
    
    removeLaser: (id) => {
        set(state => ({
            lasers: state.lasers.filter(l => l.id !== id),
            laserRefs: (() => {
                const newRefs = { ...state.laserRefs }
                delete newRefs[id]
                return newRefs
            })()
        }))
    },
    
    registerLaserRef: (id, ref) => {
        set(state => ({
            laserRefs: { ...state.laserRefs, [id]: ref }
        }))
    },
    
    unregisterLaserRef: (id) => {
        set(state => ({
            laserRefs: (() => {
                const newRefs = { ...state.laserRefs }
                delete newRefs[id]
                return newRefs
            })()
        }))
    },
    
    // === EXPLOSIONS ===
    explosions: [],
    
    addExplosion: (position, scale = 1.0) => {
        const id = ++explosionIdCounter
        set(state => ({
            explosions: [...state.explosions, { id, position, scale }]
        }))
        
        // Play explosion sound with 3D position
        useAudioStore.getState().playExplosion(position)
        
        return id
    },
    
    removeExplosion: (id) => {
        set(state => ({
            explosions: state.explosions.filter(e => e.id !== id)
        }))
    },
    
    // === ENEMIES ===
    enemies: [],
    enemyRefs: {},
    
    addEnemy: (position, health = 1) => {
        const id = ++enemyIdCounter
        const enemy = { id, position, health }
        set(state => ({
            enemies: [...state.enemies, enemy]
        }))
        return id
    },
    
    removeEnemy: (id) => {
        set(state => ({
            enemies: state.enemies.filter(e => e.id !== id),
            enemyRefs: (() => {
                const newRefs = { ...state.enemyRefs }
                delete newRefs[id]
                return newRefs
            })()
        }))
    },
    
    registerEnemyRef: (id, ref) => {
        set(state => ({
            enemyRefs: { ...state.enemyRefs, [id]: ref }
        }))
    },
    
    damageEnemy: (id, amount = 1) => {
        const { enemies, removeEnemy, addScore, addExplosion, enemyRefs } = get()
        const enemy = enemies.find(e => e.id === id)
        if (!enemy) return false
        
        const newHealth = enemy.health - amount
        if (newHealth <= 0) {
            // Enemy destroyed
            const ref = enemyRefs[id]
            if (ref?.current) {
                const pos = ref.current.position
                addExplosion([pos.x, pos.y, pos.z], 6.0)
            }
            removeEnemy(id)
            addScore(100)
            
            // Check wave completion
            const remainingEnemies = get().enemies.length - 1
            if (remainingEnemies <= 0 && get().isWaveActive) {
                get().completeWave()
            }
            return true // Destroyed
        } else {
            // Update health
            set(state => ({
                enemies: state.enemies.map(e => 
                    e.id === id ? { ...e, health: newHealth } : e
                )
            }))
            return false // Still alive
        }
    },
    
    // === SCORING ===
    score: 0,
    highScore: typeof localStorage !== 'undefined' 
        ? parseInt(localStorage.getItem('spaceHighScore') || '0') 
        : 0,
    
    addScore: (points) => {
        set(state => {
            const newScore = state.score + points
            const newHighScore = Math.max(newScore, state.highScore)
            // Save high score
            if (typeof localStorage !== 'undefined' && newHighScore > state.highScore) {
                localStorage.setItem('spaceHighScore', newHighScore.toString())
            }
            return { score: newScore, highScore: newHighScore }
        })
    },
    
    resetScore: () => set({ score: 0 }),
    
    // === WAVES ===
    currentWave: 0,
    isWaveActive: false,
    waveStartTime: 0,
    
    startWave: (waveNumber) => {
        set({
            currentWave: waveNumber,
            isWaveActive: true,
            waveStartTime: Date.now()
        })
    },
    
    completeWave: () => {
        const { currentWave, addScore } = get()
        // Wave bonus
        addScore(currentWave * 50)
        set({ isWaveActive: false })
    },
    
    nextWave: () => {
        const { currentWave, startWave } = get()
        startWave(currentWave + 1)
    },
    
    // === UTILITY ===
    clearAll: () => {
        set({
            lasers: [],
            laserRefs: {},
            explosions: [],
            enemies: [],
            enemyRefs: {},
            score: 0,
            currentWave: 0,
            isWaveActive: false
        })
    }
}))
