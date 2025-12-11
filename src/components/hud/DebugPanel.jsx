import { useDebugStore, hueToColor } from '../../stores/debugStore'
import { useEffect } from 'react'
import './DebugPanel.css'

export const DebugPanel = () => {
    const {
        showDebugPanel,
        toggleDebugPanel,
        // HUE Colors
        sunHue, planetHue1, planetHue2, moonHue,
        setSunHue, setPlanetHue1, setPlanetHue2, setMoonHue,
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
    
    // Helper to create hue slider with color preview
    const HueSlider = ({ label, value, onChange }) => (
        <div className="debug-slider debug-slider--hue">
            <label>
                {label}: 
                <span 
                    className="debug-hue-preview" 
                    style={{ backgroundColor: hueToColor(value) }}
                />
                <span>{value}°</span>
            </label>
            <input 
                type="range" 
                min="0" 
                max="360" 
                step="5" 
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                style={{
                    background: `linear-gradient(to right, 
                        hsl(0, 70%, 60%), 
                        hsl(60, 70%, 60%), 
                        hsl(120, 70%, 60%), 
                        hsl(180, 70%, 60%), 
                        hsl(240, 70%, 60%), 
                        hsl(300, 70%, 60%), 
                        hsl(360, 70%, 60%)
                    )`
                }}
            />
        </div>
    )
    
    return (
        <div className="debug-panel">
            <div className="debug-panel__header">
                <h3>🔧 DEBUG</h3>
                <button onClick={toggleDebugPanel}>×</button>
            </div>
            
            {/* HUE COLORS */}
            <div className="debug-panel__section">
                <h4>🎨 Colors (HUE)</h4>
                
                <HueSlider label="Sun" value={sunHue} onChange={setSunHue} />
                <HueSlider label="Portfolio" value={planetHue1} onChange={setPlanetHue1} />
                <HueSlider label="Contact" value={planetHue2} onChange={setPlanetHue2} />
                <HueSlider label="Moons" value={moonHue} onChange={setMoonHue} />
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
