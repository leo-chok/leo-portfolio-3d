import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useDebugStore } from '../../stores/debugStore'

/**
 * Effects Component - Optimized Post Processing
 * Uses @react-three/postprocessing for better performance
 * (Effects are merged automatically, unlike native Three.js EffectComposer)
 */
export const Effects = () => {
    // Subscribe to store values (triggers re-render only when these change)
    const bloomEnabled = useDebugStore(state => state.bloomEnabled)
    const bloomThreshold = useDebugStore(state => state.bloomThreshold)
    const bloomStrength = useDebugStore(state => state.bloomStrength)
    const bloomRadius = useDebugStore(state => state.bloomRadius)
    
    // When bloom is disabled, don't render anything - let R3F handle normal rendering
    if (!bloomEnabled) return null
    
    return (
        <EffectComposer>
            <Bloom 
                luminanceThreshold={bloomThreshold}
                luminanceSmoothing={0.9}
                intensity={bloomStrength}
                mipmapBlur={true}
                radius={bloomRadius}
            />
        </EffectComposer>
    )
}
