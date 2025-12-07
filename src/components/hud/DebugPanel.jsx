import { useDebugStore } from '../../stores/debugStore'
import { useEffect } from 'react'
import './DebugPanel.css'

// Tone mapping type names for display
const TONEMAPPING_NAMES = ['None', 'Linear', 'Reinhard', 'Cineon', 'ACES', 'AgX', 'Neutral']

/**
 * Debug Panel for real-time bloom and material adjustments
 * Press 'D' to toggle visibility
 */
export const DebugPanel = () => {
    const {
        showDebugPanel,
        toggleDebugPanel,
        // Bloom
        bloomThreshold,
        bloomStrength,
        bloomRadius,
        exposure,
        tonemapping,
        setBloomThreshold,
        setBloomStrength,
        setBloomRadius,
        setExposure,
        setTonemapping,
        // Emissive
        sunEmissive,
        planetEmissive,
        moonEmissive,
        setSunEmissive,
        setPlanetEmissive,
        setMoonEmissive,
    } = useDebugStore()
    
    // Keyboard toggle
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'd' || e.key === 'D') {
                toggleDebugPanel()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [toggleDebugPanel])
    
    // Panel completely hidden by default - only D key reveals it
    if (!showDebugPanel) {
        return null
    }
    
    return (
        <div className="debug-panel">
            <div className="debug-panel__header">
                <h3>🔧 BLOOM DEBUG</h3>
                <button onClick={toggleDebugPanel}>×</button>
            </div>
            
            {/* BLOOM EFFECT */}
            <div className="debug-panel__section">
                <h4>☀️ Bloom Effect</h4>
                
                <div className="debug-slider">
                    <label>
                        Threshold: <span>{bloomThreshold.toFixed(2)}</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={bloomThreshold}
                        onChange={(e) => setBloomThreshold(parseFloat(e.target.value))}
                    />
                </div>
                
                <div className="debug-slider">
                    <label>
                        Strength: <span>{bloomStrength.toFixed(2)}</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={bloomStrength}
                        onChange={(e) => setBloomStrength(parseFloat(e.target.value))}
                    />
                </div>
                
                <div className="debug-slider">
                    <label>
                        Radius: <span>{bloomRadius.toFixed(2)}</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.05"
                        value={bloomRadius}
                        onChange={(e) => setBloomRadius(parseFloat(e.target.value))}
                    />
                </div>
                
                <div className="debug-slider">
                    <label>
                        Exposure: <span>{exposure.toFixed(2)}</span>
                    </label>
                    <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={exposure}
                        onChange={(e) => setExposure(parseFloat(e.target.value))}
                    />
                </div>
                
                <div className="debug-slider">
                    <label>
                        Tonemapping: <span>{TONEMAPPING_NAMES[tonemapping]}</span>
                    </label>
                    <select
                        value={tonemapping}
                        onChange={(e) => setTonemapping(parseInt(e.target.value))}
                        className="debug-select"
                    >
                        <option value={0}>None</option>
                        <option value={1}>Linear</option>
                        <option value={2}>Reinhard</option>
                        <option value={3}>Cineon</option>
                        <option value={4}>ACES Filmic</option>
                        <option value={5}>AgX</option>
                        <option value={6}>Neutral</option>
                    </select>
                </div>
            </div>
            
            {/* EMISSIVE MATERIALS */}
            <div className="debug-panel__section">
                <h4>💡 Material Emissive</h4>
                
                <div className="debug-slider">
                    <label>
                        Sun: <span>{sunEmissive.toFixed(1)}</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                        value={sunEmissive}
                        onChange={(e) => setSunEmissive(parseFloat(e.target.value))}
                    />
                </div>
                
                <div className="debug-slider">
                    <label>
                        Planets: <span>{planetEmissive.toFixed(1)}</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="15"
                        step="0.5"
                        value={planetEmissive}
                        onChange={(e) => setPlanetEmissive(parseFloat(e.target.value))}
                    />
                </div>
                
                <div className="debug-slider">
                    <label>
                        Moons: <span>{moonEmissive.toFixed(1)}</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={moonEmissive}
                        onChange={(e) => setMoonEmissive(parseFloat(e.target.value))}
                    />
                </div>
            </div>
            
            {/* VALUES PREVIEW */}
            <div className="debug-panel__values">
                <h4>📋 Copy Values</h4>
                <pre>{`// Bloom
threshold: ${bloomThreshold}
strength: ${bloomStrength}
radius: ${bloomRadius}
exposure: ${exposure}

// Emissive
sun: ${sunEmissive}
planet: ${planetEmissive}
moon: ${moonEmissive}`}</pre>
            </div>
        </div>
    )
}

