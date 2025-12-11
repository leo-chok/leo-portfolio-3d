import { useDebugStore } from '../../stores/debugStore'
import { useEffect } from 'react'
import './DebugPanel.css'

export const DebugPanel = () => {
    const {
        showDebugPanel,
        toggleDebugPanel,
        // Bloom
        bloomEnabled, toggleBloomEnabled,
        bloomThreshold, bloomStrength, bloomRadius,
        setBloomThreshold, setBloomStrength, setBloomRadius,
        // Emissive
        sunEmissive, planetEmissive, moonEmissive,
        setSunEmissive, setPlanetEmissive, setMoonEmissive,
        // Particles
        starsCount, dustCount,
        setStarsCount, setDustCount,
    } = useDebugStore()
    
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'd' || e.key === 'D') {
                toggleDebugPanel()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [toggleDebugPanel])
    
    if (!showDebugPanel) return null
    
    return (
        <div className="debug-panel">
            <div className="debug-panel__header">
                <h3>🔧 DEBUG</h3>
                <button onClick={toggleDebugPanel}>×</button>
            </div>
            
            {/* BLOOM EFFECT */}
            <div className="debug-panel__section">
                <h4>
                    ☀️ Bloom 
                    <button 
                        onClick={toggleBloomEnabled}
                        style={{ 
                            marginLeft: '10px', 
                            padding: '2px 8px',
                            background: bloomEnabled ? '#00ff00' : '#ff4444',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '10px'
                        }}
                    >
                        {bloomEnabled ? 'ON' : 'OFF'}
                    </button>
                </h4>
                
                <div className="debug-slider">
                    <label>Threshold: <span>{bloomThreshold.toFixed(2)}</span></label>
                    <input type="range" min="0" max="1" step="0.01" value={bloomThreshold}
                        onChange={(e) => setBloomThreshold(parseFloat(e.target.value))} />
                </div>
                
                <div className="debug-slider">
                    <label>Strength: <span>{bloomStrength.toFixed(2)}</span></label>
                    <input type="range" min="0" max="5" step="0.1" value={bloomStrength}
                        onChange={(e) => setBloomStrength(parseFloat(e.target.value))} />
                </div>
                
                <div className="debug-slider">
                    <label>Radius: <span>{bloomRadius.toFixed(2)}</span></label>
                    <input type="range" min="0" max="2" step="0.05" value={bloomRadius}
                        onChange={(e) => setBloomRadius(parseFloat(e.target.value))} />
                </div>
            </div>
            
            {/* EMISSIVE MATERIALS */}
            <div className="debug-panel__section">
                <h4>💡 Emissive</h4>
                
                <div className="debug-slider">
                    <label>Sun: <span>{sunEmissive.toFixed(1)}</span></label>
                    <input type="range" min="1" max="20" step="0.5" value={sunEmissive}
                        onChange={(e) => setSunEmissive(parseFloat(e.target.value))} />
                </div>
                
                <div className="debug-slider">
                    <label>Planets: <span>{planetEmissive.toFixed(1)}</span></label>
                    <input type="range" min="1" max="15" step="0.5" value={planetEmissive}
                        onChange={(e) => setPlanetEmissive(parseFloat(e.target.value))} />
                </div>
                
                <div className="debug-slider">
                    <label>Moons: <span>{moonEmissive.toFixed(1)}</span></label>
                    <input type="range" min="1" max="10" step="0.5" value={moonEmissive}
                        onChange={(e) => setMoonEmissive(parseFloat(e.target.value))} />
                </div>
            </div>
            
            {/* PARTICLES (PERFORMANCE) */}
            <div className="debug-panel__section">
                <h4>✨ Particles (Performance)</h4>
                
                <div className="debug-slider">
                    <label>Stars: <span>{starsCount}</span></label>
                    <input type="range" min="500" max="8000" step="500" value={starsCount}
                        onChange={(e) => setStarsCount(parseInt(e.target.value))} />
                </div>
                
                <div className="debug-slider">
                    <label>Space Dust: <span>{dustCount}</span></label>
                    <input type="range" min="500" max="8000" step="500" value={dustCount}
                        onChange={(e) => setDustCount(parseInt(e.target.value))} />
                </div>
                
                <div style={{ fontSize: '9px', color: 'rgba(124, 196, 237, 0.5)', marginTop: '8px' }}>
                    Total: {starsCount + dustCount} particles
                </div>
            </div>
        </div>
    )
}
