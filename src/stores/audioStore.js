import { create } from 'zustand'

/**
 * Audio Store - Central state management for all audio
 * 
 * Manages:
 * - Ambient music (background loop)
 * - UI SFX (clicks, hovers, transitions)
 * - Game SFX (lasers, explosions, engine)
 * - Global volume & mute state
 */

// Audio file paths - organized by category
export const AUDIO_FILES = {
    // Ambient music
    ambientSpace: '/audio/ambient/space.mp3',
    ambientChase: '/audio/ambient/chase.mp3',
    
    // UI sounds
    uiClick: '/audio/ui/click.wav',
    uiHover: '/audio/ui/hover.wav',
    uiHover2: '/audio/ui/hover2.wav',
    uiDecrypt: '/audio/ui/decrypt.wav',
    uiNotification: '/audio/ui/notification.wav',
    uiValidation: '/audio/ui/validation.wav',
    planetClick: '/audio/ui/planetClick.wav',
    
    // Game sounds
    laser1: '/audio/game/laser1.wav',
    laser2: '/audio/game/laser2.wav',
    explosion: '/audio/game/explosion.wav',
    gameOver: '/audio/game/gameover.wav',
    engine: '/audio/game/motor.wav',
    shieldHit: '/audio/game/shieldHit.wav',
}

// Volume presets by category
export const VOLUME_PRESETS = {
    ambientSpace: 0.4,   // 🌌 Exploration (calme)
    ambientChase: 0.15,  // ⚔️ Combat (moins fort)
    ui: 0.4,
    game: 0.8,
    master: 0.8,
}

// ===================================
// SFX VOLUME CONFIGURATION
// Adjust individual sound volumes here
// ===================================
export const SFX_VOLUMES = {
    // Player
    playerLaser: 0.5,      // Player's pew pew
    
    // Enemies  
    enemyLaser: 0.5,       // Enemy laser (slightly quieter)
    
    // Explosions
    explosion: 0.4,        // 💥 Boom! (0.0 - 1.0)
    
    // Game events
    gameOver: 0.7,         // 💀 Death sound
    shieldHit: 0.5,        // 🛡️ Got hit
    
    // Engine
    engineMin: 0.1,        // 🚀 Engine at idle
    engineMax: 0.4,        // 🚀 Engine at max speed
    
    // UI sounds
    uiClick: 0.2,          // 🖱️ Button click
    uiHover: 0.4,          // 👆 Button hover (subtle)
    uiHover2: 0.3,         // 🎴 Card hover (Resume)
    uiDecrypt: 0.2,        // 🔓 Planet analysis
    uiNotification: 0.5,   // 🔔 Modal appears
    uiValidation: 0.6,     // ✅ Welcome page CTA
    planetClick: 0.5,      // 🌍 Planet/Sun click
}

export const useAudioStore = create((set, get) => ({
    // === STATE ===
    isInitialized: false,
    isMuted: false,
    masterVolume: VOLUME_PRESETS.master,
    ambientVolume: VOLUME_PRESETS.ambientSpace,
    sfxVolume: VOLUME_PRESETS.ui,
    
    // Audio context and nodes
    audioContext: null,
    masterGain: null,
    ambientGain: null,
    sfxGain: null,
    
    // Currently playing ambient
    ambientSource: null,
    ambientBuffers: {}, // { space: buffer, chase: buffer }
    currentTrack: 'space', // 'space' | 'chase'
    isAmbientPlaying: false,
    
    // Preloaded SFX buffers
    sfxBuffers: {},
    
    // Engine loop state
    engineSource: null,
    engineGain: null,
    isEnginePlaying: false,
    
    // 3D Audio listener position (follows player ship)
    listenerPosition: { x: 0, y: 0, z: 0 },
    
    /**
     * Update listener position for 3D spatial audio
     * Call this each frame with the player's position
     * @param {Object} position - {x, y, z} player world position
     */
    updateListenerPosition: (position) => {
        const { audioContext } = get()
        if (!audioContext) return
        
        const listener = audioContext.listener
        const x = position?.x || 0
        const y = position?.y || 0
        const z = position?.z || 0
        
        // Update Web Audio listener position
        if (listener.positionX) {
            // Modern API
            listener.positionX.setValueAtTime(x, audioContext.currentTime)
            listener.positionY.setValueAtTime(y, audioContext.currentTime)
            listener.positionZ.setValueAtTime(z, audioContext.currentTime)
        } else {
            // Legacy API fallback
            listener.setPosition(x, y, z)
        }
        
        set({ listenerPosition: { x, y, z } })
    },
    
    // === INITIALIZATION ===
    initAudio: async () => {
        const state = get()
        if (state.isInitialized) return
        
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext
            const audioContext = new AudioContext()
            
            // Create gain nodes
            const masterGain = audioContext.createGain()
            masterGain.gain.value = VOLUME_PRESETS.master
            masterGain.connect(audioContext.destination)
            
            const ambientGain = audioContext.createGain()
            ambientGain.gain.value = VOLUME_PRESETS.ambientSpace
            ambientGain.connect(masterGain)
            
            const sfxGain = audioContext.createGain()
            sfxGain.gain.value = VOLUME_PRESETS.ui
            sfxGain.connect(masterGain)
            
            set({
                isInitialized: true,
                audioContext,
                masterGain,
                ambientGain,
                sfxGain,
            })
            
            console.log('[Audio] Initialized successfully')
            
            // Preload ambient music (both tracks)
            get().loadAmbient('space')
            get().loadAmbient('chase')
            
            // Preload laser sounds
            get().loadSFX('laser1')
            get().loadSFX('laser2')
            
            // Preload explosion and game sounds
            get().loadSFX('explosion')
            get().loadSFX('gameOver')
            get().loadSFX('engine')
            get().loadSFX('shieldHit')
            
            // Preload UI sounds
            get().loadSFX('uiClick')
            get().loadSFX('uiHover')
            get().loadSFX('uiHover2')
            get().loadSFX('uiDecrypt')
            get().loadSFX('uiNotification')
            get().loadSFX('uiValidation')
            get().loadSFX('planetClick')
            
        } catch (error) {
            console.error('[Audio] Failed to initialize:', error)
        }
    },
    
    // === AMBIENT MUSIC ===
    loadAmbient: async (track = 'space') => {
        const { audioContext, ambientBuffers } = get()
        if (!audioContext || ambientBuffers[track]) return
        
        const path = track === 'chase' ? AUDIO_FILES.ambientChase : AUDIO_FILES.ambientSpace
        
        try {
            const response = await fetch(path)
            if (!response.ok) {
                console.warn(`[Audio] Ambient ${track} file not found, skipping`)
                return
            }
            
            const arrayBuffer = await response.arrayBuffer()
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
            
            set(state => ({
                ambientBuffers: { ...state.ambientBuffers, [track]: audioBuffer }
            }))
            console.log(`[Audio] Ambient ${track} loaded`)
            
        } catch (error) {
            console.warn(`[Audio] Could not load ambient ${track}:`, error.message)
        }
    },
    
    playAmbient: (track = 'space') => {
        const { audioContext, ambientGain, ambientBuffers, isAmbientPlaying, isMuted } = get()
        const buffer = ambientBuffers[track]
        
        console.log(`[Audio] playAmbient called:`, { 
            track, 
            hasContext: !!audioContext, 
            hasBuffer: !!buffer, 
            isAmbientPlaying,
            bufferDuration: buffer?.duration 
        })
        
        if (!audioContext || !buffer || isAmbientPlaying) return
        
        // Resume context if suspended (browser policy)
        if (audioContext.state === 'suspended') {
            audioContext.resume()
        }
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        source.loop = true
        source.connect(ambientGain)
        
        // Fade in
        ambientGain.gain.setValueAtTime(0, audioContext.currentTime)
        ambientGain.gain.linearRampToValueAtTime(
            isMuted ? 0 : (track === 'chase' ? VOLUME_PRESETS.ambientChase : VOLUME_PRESETS.ambientSpace), 
            audioContext.currentTime + 2
        )
        
        source.start()
        
        set({ ambientSource: source, isAmbientPlaying: true, currentTrack: track })
        console.log(`[Audio] Ambient ${track} playing`)
    },
    
    stopAmbient: () => {
        const { audioContext, ambientGain, ambientSource, isAmbientPlaying } = get()
        if (!ambientSource || !isAmbientPlaying) return
        
        // Fade out
        ambientGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1)
        
        setTimeout(() => {
            try {
                ambientSource.stop()
            } catch (e) {
                // Already stopped
            }
            set({ ambientSource: null, isAmbientPlaying: false })
        }, 1000)
    },
    
    // Switch between ambient tracks with crossfade
    switchAmbient: (newTrack) => {
        const { currentTrack, isAmbientPlaying, audioContext, ambientGain, ambientSource, ambientBuffers, isMuted } = get()
        if (newTrack === currentTrack || !audioContext) return
        
        const buffer = ambientBuffers[newTrack]
        if (!buffer) {
            console.warn(`[Audio] Buffer for ${newTrack} not loaded`)
            return
        }
        
        console.log(`[Audio] Switching from ${currentTrack} to ${newTrack}`)
        
        // Crossfade: fade out current, fade in new
        const fadeTime = 1.5
        
        // Fade out current
        if (ambientSource && isAmbientPlaying) {
            ambientGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + fadeTime)
            const oldSource = ambientSource
            setTimeout(() => {
                try { oldSource.stop() } catch (e) {}
            }, fadeTime * 1000)
        }
        
        // Create and start new source
        const newSource = audioContext.createBufferSource()
        newSource.buffer = buffer
        newSource.loop = true
        newSource.connect(ambientGain)
        
        // Schedule fade in after fade out
        setTimeout(() => {
            ambientGain.gain.setValueAtTime(0, audioContext.currentTime)
            ambientGain.gain.linearRampToValueAtTime(
                isMuted ? 0 : (newTrack === 'chase' ? VOLUME_PRESETS.ambientChase : VOLUME_PRESETS.ambientSpace),
                audioContext.currentTime + fadeTime
            )
            newSource.start()
            set({ ambientSource: newSource, currentTrack: newTrack, isAmbientPlaying: true })
        }, fadeTime * 1000)
    },
    
    // === SFX ===
    loadSFX: async (key) => {
        const { audioContext, sfxBuffers } = get()
        if (!audioContext || sfxBuffers[key]) return
        
        const path = AUDIO_FILES[key]
        if (!path) return
        
        try {
            const response = await fetch(path)
            if (!response.ok) return
            
            const arrayBuffer = await response.arrayBuffer()
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
            
            set(state => ({
                sfxBuffers: { ...state.sfxBuffers, [key]: audioBuffer }
            }))
            
        } catch (error) {
            console.warn(`[Audio] Could not load SFX '${key}':`, error.message)
        }
    },
    
    playSFX: (key, volume = 1) => {
        const { audioContext, sfxGain, sfxBuffers, isMuted } = get()
        if (!audioContext || isMuted) return
        
        const buffer = sfxBuffers[key]
        if (!buffer) {
            // Try to load and play
            get().loadSFX(key)
            return
        }
        
        // Resume context if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume()
        }
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        
        // Individual volume control
        const gainNode = audioContext.createGain()
        gainNode.gain.value = volume
        source.connect(gainNode)
        gainNode.connect(sfxGain)
        
        source.start()
    },
    
    // === UI SOUND EFFECTS ===
    
    playClick: () => {
        const { audioContext, sfxGain, sfxBuffers, isMuted } = get()
        if (!audioContext || isMuted) return
        
        let buffer = sfxBuffers['uiClick']
        if (!buffer) { get().loadSFX('uiClick'); return }
        
        if (audioContext.state === 'suspended') audioContext.resume()
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        const gainNode = audioContext.createGain()
        gainNode.gain.value = SFX_VOLUMES.uiClick
        source.connect(gainNode)
        gainNode.connect(sfxGain)
        source.start()
    },
    
    playHover: () => {
        const { audioContext, sfxGain, sfxBuffers, isMuted } = get()
        if (!audioContext || isMuted) return
        
        let buffer = sfxBuffers['uiHover']
        if (!buffer) { get().loadSFX('uiHover'); return }
        
        if (audioContext.state === 'suspended') audioContext.resume()
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        const gainNode = audioContext.createGain()
        gainNode.gain.value = SFX_VOLUMES.uiHover
        source.connect(gainNode)
        gainNode.connect(sfxGain)
        source.start()
    },
    
    playHover2: () => {
        const { audioContext, sfxGain, sfxBuffers, isMuted } = get()
        if (!audioContext || isMuted) return
        
        let buffer = sfxBuffers['uiHover2']
        if (!buffer) { get().loadSFX('uiHover2'); return }
        
        if (audioContext.state === 'suspended') audioContext.resume()
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        const gainNode = audioContext.createGain()
        gainNode.gain.value = SFX_VOLUMES.uiHover2
        source.connect(gainNode)
        gainNode.connect(sfxGain)
        source.start()
    },
    
    playDecrypt: () => {
        const { audioContext, sfxGain, sfxBuffers, isMuted } = get()
        if (!audioContext || isMuted) return
        
        let buffer = sfxBuffers['uiDecrypt']
        if (!buffer) { get().loadSFX('uiDecrypt'); return }
        
        if (audioContext.state === 'suspended') audioContext.resume()
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        const gainNode = audioContext.createGain()
        gainNode.gain.value = SFX_VOLUMES.uiDecrypt
        source.connect(gainNode)
        gainNode.connect(sfxGain)
        source.start()
    },
    
    playPlanetClick: () => {
        const { audioContext, sfxGain, sfxBuffers, isMuted } = get()
        if (!audioContext || isMuted) return
        
        let buffer = sfxBuffers['planetClick']
        if (!buffer) { get().loadSFX('planetClick'); return }
        
        if (audioContext.state === 'suspended') audioContext.resume()
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        const gainNode = audioContext.createGain()
        gainNode.gain.value = SFX_VOLUMES.planetClick
        source.connect(gainNode)
        gainNode.connect(sfxGain)
        source.start()
    },
    
    playNotification: () => {
        const { audioContext, sfxGain, sfxBuffers, isMuted } = get()
        if (!audioContext || isMuted) return
        
        let buffer = sfxBuffers['uiNotification']
        if (!buffer) { get().loadSFX('uiNotification'); return }
        
        if (audioContext.state === 'suspended') audioContext.resume()
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        const gainNode = audioContext.createGain()
        gainNode.gain.value = SFX_VOLUMES.uiNotification
        source.connect(gainNode)
        gainNode.connect(sfxGain)
        source.start()
    },
    
    playValidation: () => {
        const { audioContext, sfxGain, sfxBuffers, isMuted } = get()
        if (!audioContext || isMuted) return
        
        let buffer = sfxBuffers['uiValidation']
        if (!buffer) { get().loadSFX('uiValidation'); return }
        
        if (audioContext.state === 'suspended') audioContext.resume()
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        const gainNode = audioContext.createGain()
        gainNode.gain.value = SFX_VOLUMES.uiValidation
        source.connect(gainNode)
        gainNode.connect(sfxGain)
        source.start()
    },
    
    /**
     * Play laser sound (random selection, no 3D - for player's own shots)
     */
    playLaser: () => {
        const { audioContext, sfxGain, sfxBuffers, isMuted } = get()
        if (!audioContext || isMuted) return
        
        // Use configured volume
        const volume = SFX_VOLUMES.playerLaser
        
        // Random selection between two laser sounds
        const laserKey = Math.random() > 0.5 ? 'laser1' : 'laser2'
        let buffer = sfxBuffers[laserKey]
        
        if (!buffer) {
            buffer = sfxBuffers[laserKey === 'laser1' ? 'laser2' : 'laser1']
        }
        
        if (!buffer) {
            get().loadSFX('laser1')
            get().loadSFX('laser2')
            return
        }
        
        if (audioContext.state === 'suspended') {
            audioContext.resume()
        }
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        
        const gainNode = audioContext.createGain()
        gainNode.gain.value = volume
        source.connect(gainNode)
        gainNode.connect(sfxGain)
        
        source.start()
    },
    
    // === ENGINE SOUND (looping) ===
    
    /**
     * Start engine sound loop
     */
    startEngine: () => {
        const { audioContext, sfxGain, sfxBuffers, isMuted, isEnginePlaying } = get()
        if (!audioContext || isEnginePlaying) return
        
        const buffer = sfxBuffers['engine']
        if (!buffer) {
            get().loadSFX('engine')
            return
        }
        
        if (audioContext.state === 'suspended') {
            audioContext.resume()
        }
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        source.loop = true
        source.playbackRate.value = 0.8 // Start at low pitch
        
        const gainNode = audioContext.createGain()
        gainNode.gain.value = isMuted ? 0 : SFX_VOLUMES.engineMin
        
        source.connect(gainNode)
        gainNode.connect(sfxGain)
        
        source.start()
        
        set({ 
            engineSource: source, 
            engineGain: gainNode, 
            isEnginePlaying: true 
        })
        console.log('[Audio] Engine started')
    },
    
    /**
     * Stop engine sound loop
     */
    stopEngine: () => {
        const { engineSource, engineGain, audioContext, isEnginePlaying } = get()
        if (!isEnginePlaying || !engineSource) return
        
        // Fade out
        if (engineGain && audioContext) {
            engineGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3)
        }
        
        setTimeout(() => {
            try {
                engineSource.stop()
            } catch (e) {}
            set({ engineSource: null, engineGain: null, isEnginePlaying: false })
        }, 300)
        
        console.log('[Audio] Engine stopped')
    },
    
    /**
     * Update engine pitch and volume based on speed
     * @param {number} speedPercent - Speed as percentage (0-1)
     */
    updateEngine: (speedPercent) => {
        const { engineSource, engineGain, audioContext, isMuted, isEnginePlaying } = get()
        if (!isEnginePlaying || !engineSource || !engineGain || !audioContext) return
        
        // Clamp speed
        const speed = Math.max(0, Math.min(1, speedPercent))
        
        // Pitch: 0.7 (idle) to 1.3 (max speed)
        const pitch = 0.7 + speed * 0.6
        engineSource.playbackRate.setTargetAtTime(pitch, audioContext.currentTime, 0.1)
        
        // Volume: engineMin to engineMax
        const volume = isMuted ? 0 : (SFX_VOLUMES.engineMin + speed * (SFX_VOLUMES.engineMax - SFX_VOLUMES.engineMin))
        engineGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1)
    },
    
    /**
     * Play explosion sound with 3D spatial positioning
     * @param {Object|Array} position - {x, y, z} or [x, y, z] world position
     */
    playExplosion: (position) => {
        const { audioContext, sfxGain, sfxBuffers, isMuted } = get()
        if (!audioContext || isMuted) return
        
        const volume = SFX_VOLUMES.explosion
        const buffer = sfxBuffers['explosion']
        
        if (!buffer) {
            get().loadSFX('explosion')
            return
        }
        
        if (audioContext.state === 'suspended') {
            audioContext.resume()
        }
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        
        // Create panner for 3D positioning
        const panner = audioContext.createPanner()
        panner.panningModel = 'HRTF'
        panner.distanceModel = 'inverse'
        panner.refDistance = 15
        panner.maxDistance = 800
        panner.rolloffFactor = 1.0 // Slower falloff for explosions (more audible at distance)
        panner.coneInnerAngle = 360
        panner.coneOuterAngle = 360
        panner.coneOuterGain = 1
        
        // Set position (handle both array and object)
        if (position) {
            const x = Array.isArray(position) ? position[0] : (position.x || 0)
            const y = Array.isArray(position) ? position[1] : (position.y || 0)
            const z = Array.isArray(position) ? position[2] : (position.z || 0)
            panner.positionX.setValueAtTime(x, audioContext.currentTime)
            panner.positionY.setValueAtTime(y, audioContext.currentTime)
            panner.positionZ.setValueAtTime(z, audioContext.currentTime)
        }
        
        const gainNode = audioContext.createGain()
        gainNode.gain.value = volume
        
        source.connect(panner)
        panner.connect(gainNode)
        gainNode.connect(sfxGain)
        
        source.start()
    },
    
    /**
     * Play game over sound (death)
     */
    playGameOver: () => {
        const { audioContext, sfxGain, sfxBuffers, isMuted } = get()
        if (!audioContext || isMuted) return
        
        const volume = SFX_VOLUMES.gameOver
        let buffer = sfxBuffers['gameOver']
        
        if (!buffer) {
            get().loadSFX('gameOver')
            return
        }
        
        if (audioContext.state === 'suspended') {
            audioContext.resume()
        }
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        
        const gainNode = audioContext.createGain()
        gainNode.gain.value = volume
        source.connect(gainNode)
        gainNode.connect(sfxGain)
        
        source.start()
    },
    
    /**
     * Play shield hit sound (player got hit)
     */
    playShieldHit: () => {
        const { audioContext, sfxGain, sfxBuffers, isMuted } = get()
        if (!audioContext || isMuted) return
        
        const volume = SFX_VOLUMES.shieldHit
        let buffer = sfxBuffers['shieldHit']
        
        if (!buffer) {
            get().loadSFX('shieldHit')
            return
        }
        
        if (audioContext.state === 'suspended') {
            audioContext.resume()
        }
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        
        // Random pitch variation for variety
        source.playbackRate.value = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
        
        const gainNode = audioContext.createGain()
        gainNode.gain.value = volume
        source.connect(gainNode)
        gainNode.connect(sfxGain)
        
        source.start()
    },
    
    /**
     * Play laser sound with 3D spatial positioning (for enemies)
     * @param {Object} position - {x, y, z} world position of the sound source
     */
    playLaser3D: (position) => {
        const { audioContext, sfxGain, sfxBuffers, isMuted } = get()
        if (!audioContext || isMuted) return
        
        // Use configured volume
        const volume = SFX_VOLUMES.enemyLaser
        
        // Random selection between two laser sounds
        const laserKey = Math.random() > 0.5 ? 'laser1' : 'laser2'
        let buffer = sfxBuffers[laserKey]
        
        // Try the other laser if this one isn't loaded
        if (!buffer) {
            buffer = sfxBuffers[laserKey === 'laser1' ? 'laser2' : 'laser1']
        }
        
        if (!buffer) {
            // Buffers not loaded yet, try loading now
            get().loadSFX('laser1')
            get().loadSFX('laser2')
            return
        }
        
        // Resume context if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume()
        }
        
        const source = audioContext.createBufferSource()
        source.buffer = buffer
        
        // Create panner for 3D positioning
        const panner = audioContext.createPanner()
        panner.panningModel = 'HRTF' // High-quality 3D
        panner.distanceModel = 'inverse'
        panner.refDistance = 10 // Distance at which volume is 100%
        panner.maxDistance = 500 // Max audible distance
        panner.rolloffFactor = 1.5 // How fast volume decreases with distance
        panner.coneInnerAngle = 360
        panner.coneOuterAngle = 360
        panner.coneOuterGain = 1
        
        // Set position
        if (position) {
            panner.positionX.setValueAtTime(position.x || 0, audioContext.currentTime)
            panner.positionY.setValueAtTime(position.y || 0, audioContext.currentTime)
            panner.positionZ.setValueAtTime(position.z || 0, audioContext.currentTime)
        }
        
        // Volume control
        const gainNode = audioContext.createGain()
        gainNode.gain.value = volume
        
        // Connect: source -> panner -> gain -> sfxGain -> master
        source.connect(panner)
        panner.connect(gainNode)
        gainNode.connect(sfxGain)
        
        source.start()
    },
    
    // === VOLUME CONTROLS ===
    setMasterVolume: (volume) => {
        const { masterGain, audioContext } = get()
        if (!masterGain) return
        
        masterGain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1)
        set({ masterVolume: volume })
    },
    
    toggleMute: () => {
        const { isMuted, masterGain, audioContext, masterVolume } = get()
        if (!masterGain) return
        
        const newMuted = !isMuted
        masterGain.gain.linearRampToValueAtTime(
            newMuted ? 0 : masterVolume,
            audioContext.currentTime + 0.2
        )
        
        set({ isMuted: newMuted })
        console.log('[Audio] Muted:', newMuted)
    },
    
    // === CLEANUP ===
    cleanup: () => {
        const { ambientSource, audioContext } = get()
        
        if (ambientSource) {
            ambientSource.stop()
        }
        
        if (audioContext) {
            audioContext.close()
        }
        
        set({
            isInitialized: false,
            audioContext: null,
            ambientSource: null,
            isAmbientPlaying: false,
        })
    },
}))
