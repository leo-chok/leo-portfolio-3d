import { extend, useThree, useFrame } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useDebugStore } from '../../stores/debugStore'

extend({ EffectComposer, RenderPass, UnrealBloomPass, OutputPass })

/**
 * Effects Component - Unreal Bloom Post Processing
 * Connected to DebugStore for real-time parameter adjustments
 */
export const Effects = () => {
    const { gl, scene, camera, size } = useThree()
    const composerRef = useRef(null)
    const bloomPassRef = useRef(null)
    
    // Get debug values from store - using getState for real-time updates
    const getBloomParams = () => useDebugStore.getState()
    
    useEffect(() => {
        gl.autoRender = false
        
        // Tone mapping
        gl.toneMapping = THREE.ReinhardToneMapping
        gl.toneMappingExposure = 1.0
        
        // HDR render target
        const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, { 
            type: THREE.HalfFloatType,
            format: THREE.RGBAFormat,
            depthBuffer: true,
        })
        renderTarget.samples = 4

        // Effect composer
        const effectComposer = new EffectComposer(gl, renderTarget)
        effectComposer.setSize(size.width, size.height)
        
        // Render pass
        const renderPass = new RenderPass(scene, camera)
        effectComposer.addPass(renderPass)

        // Bloom pass - with initial values
        const { bloomThreshold, bloomStrength, bloomRadius } = getBloomParams()
        const bloom = new UnrealBloomPass(
            new THREE.Vector2(size.width, size.height), 
            bloomStrength,
            bloomRadius,
            bloomThreshold
        )
        effectComposer.addPass(bloom)
        
        // Output pass - applies tone mapping and gamma correction
        const outputPass = new OutputPass()
        effectComposer.addPass(outputPass)
        
        // Store refs
        composerRef.current = effectComposer
        bloomPassRef.current = bloom
        
        console.log('🌸 Bloom initialized:', { threshold: bloomThreshold, strength: bloomStrength, radius: bloomRadius })

        return () => {
            gl.autoRender = true
            gl.toneMapping = THREE.NoToneMapping
            effectComposer.dispose()
            renderTarget.dispose()
            composerRef.current = null
            bloomPassRef.current = null
        }
    }, [gl, scene, camera, size])
    
    // Tonemapping type mapping
    const TONEMAPPING_TYPES = [
        THREE.NoToneMapping,
        THREE.LinearToneMapping,
        THREE.ReinhardToneMapping,
        THREE.CineonToneMapping,
        THREE.ACESFilmicToneMapping,
        THREE.AgXToneMapping,
        THREE.NeutralToneMapping,
    ]
    
    // Update bloom parameters in real-time from debug store
    useFrame(() => {
        const { bloomThreshold, bloomStrength, bloomRadius, exposure, tonemapping } = getBloomParams()
        
        if (bloomPassRef.current) {
            bloomPassRef.current.threshold = bloomThreshold
            bloomPassRef.current.strength = bloomStrength
            bloomPassRef.current.radius = bloomRadius
        }
        
        // Apply tonemapping type
        gl.toneMapping = TONEMAPPING_TYPES[tonemapping] ?? THREE.ReinhardToneMapping
        gl.toneMappingExposure = exposure
        
        if (composerRef.current) {
            composerRef.current.render()
        }
    }, 1)

    return null
}


