import { useDebugStore, hueToColor } from '../../stores/debugStore'
import { useEffect, useState } from 'react'
import './DebugPanel.css'

/**
 * DebugPanel - Real-time celestial body customization
 * Collapsible sections for each body type
 */
export const DebugPanel = () => {
    const {
        showDebugPanel, toggleDebugPanel,
        sun, setSun,
        planets, setPlanet,
        moons, setMoon,
        starsCount, dustCount, setStarsCount, setDustCount,
        resetAll,
    } = useDebugStore()
    
    const [expandedSection, setExpandedSection] = useState(null)
    
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
    
    // Reusable slider component
    const Slider = ({ label, value, onChange, min, max, step = 1, showColor = false }) => (
        <div className="debug-slider">
            <label>
                {label}:
                {showColor && (
                    <span 
                        className="debug-hue-preview" 
                        style={{ backgroundColor: hueToColor(value) }}
                    />
                )}
                <span>{typeof value === 'number' ? value.toFixed(step < 1 ? 1 : 0) : value}</span>
            </label>
            <input 
                type="range" 
                min={min} 
                max={max} 
                step={step} 
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                style={showColor ? {
                    background: `linear-gradient(to right, 
                        hsl(0, 70%, 60%), hsl(60, 70%, 60%), 
                        hsl(120, 70%, 60%), hsl(180, 70%, 60%), 
                        hsl(240, 70%, 60%), hsl(300, 70%, 60%), hsl(360, 70%, 60%)
                    )`
                } : undefined}
            />
        </div>
    )
    
    // Collapsible section header
    const SectionHeader = ({ id, title, color }) => (
        <div 
            className={`debug-section-header ${expandedSection === id ? 'expanded' : ''}`}
            onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        >
            <span className="debug-section-dot" style={{ backgroundColor: color }} />
            <span>{title}</span>
            <span className="debug-section-arrow">{expandedSection === id ? '▼' : '▶'}</span>
        </div>
    )
    
    // Body controls (HUE, Size, OrbitRadius, OrbitTilt)
    const BodyControls = ({ data, onChange, showOrbit = true }) => (
        <div className="debug-body-controls">
            <Slider label="HUE" value={data.hue} onChange={(v) => onChange('hue', v)} min={0} max={360} step={5} showColor />
            <Slider label="Size" value={data.size} onChange={(v) => onChange('size', v)} min={0.3} max={10} step={0.1} />
            {showOrbit && (
                <>
                    <Slider label="Orbit Radius" value={data.orbitRadius} onChange={(v) => onChange('orbitRadius', v)} min={3} max={80} step={1} />
                    <Slider label="Orbit Tilt" value={data.orbitTilt} onChange={(v) => onChange('orbitTilt', v)} min={0} max={90} step={5} />
                </>
            )}
        </div>
    )
    
    return (
        <div className="debug-panel debug-panel--large">
            <div className="debug-panel__header">
                <h3>🔧 DEBUG</h3>
                <div className="debug-panel__header-actions">
                    <button className="debug-reset-btn" onClick={resetAll}>Reset</button>
                    <button onClick={toggleDebugPanel}>×</button>
                </div>
            </div>
            
            {/* SUN */}
            <div className="debug-panel__section">
                <SectionHeader id="sun" title="☀️ PRÉSENTATION (Sun)" color={hueToColor(sun.hue)} />
                {expandedSection === 'sun' && (
                    <BodyControls 
                        data={sun} 
                        onChange={(key, value) => setSun(key, value)} 
                        showOrbit={false} 
                    />
                )}
            </div>
            
            {/* PLANETS */}
            <div className="debug-panel__section">
                <SectionHeader id="portfolio" title="🪐 PORTFOLIO" color={hueToColor(planets.portfolio?.hue)} />
                {expandedSection === 'portfolio' && (
                    <BodyControls 
                        data={planets.portfolio} 
                        onChange={(key, value) => setPlanet('portfolio', key, value)} 
                    />
                )}
            </div>
            
            <div className="debug-panel__section">
                <SectionHeader id="formation" title="🪐 FORMATION" color={hueToColor(planets.formation?.hue)} />
                {expandedSection === 'formation' && (
                    <BodyControls 
                        data={planets.formation} 
                        onChange={(key, value) => setPlanet('formation', key, value)} 
                    />
                )}
            </div>
            
            <div className="debug-panel__section">
                <SectionHeader id="skills" title="🪐 COMPÉTENCES" color={hueToColor(planets.skills?.hue)} />
                {expandedSection === 'skills' && (
                    <BodyControls 
                        data={planets.skills} 
                        onChange={(key, value) => setPlanet('skills', key, value)} 
                    />
                )}
            </div>
            
            <div className="debug-panel__section">
                <SectionHeader id="contact" title="🪐 CONTACT" color={hueToColor(planets.contact?.hue)} />
                {expandedSection === 'contact' && (
                    <BodyControls 
                        data={planets.contact} 
                        onChange={(key, value) => setPlanet('contact', key, value)} 
                    />
                )}
            </div>
            
            {/* MOONS - Portfolio */}
            <div className="debug-panel__section debug-panel__section--moons">
                <h4 className="debug-moons-title">🌙 Portfolio Moons</h4>
                {['moon-keepgoals', 'moon-toothy', 'moon-jambonbeurre', 'moon-pokedex', 'moon-clickit'].map(moonId => (
                    <div key={moonId}>
                        <SectionHeader 
                            id={moonId} 
                            title={moonId.replace('moon-', '').toUpperCase()} 
                            color={hueToColor(moons[moonId]?.hue)} 
                        />
                        {expandedSection === moonId && (
                            <BodyControls 
                                data={moons[moonId]} 
                                onChange={(key, value) => setMoon(moonId, key, value)} 
                            />
                        )}
                    </div>
                ))}
            </div>
            
            {/* MOONS - Skills */}
            <div className="debug-panel__section debug-panel__section--moons">
                <h4 className="debug-moons-title">🌙 Skills Moons</h4>
                {['moon-hardskills', 'moon-softskills'].map(moonId => (
                    <div key={moonId}>
                        <SectionHeader 
                            id={moonId} 
                            title={moonId.replace('moon-', '').toUpperCase()} 
                            color={hueToColor(moons[moonId]?.hue)} 
                        />
                        {expandedSection === moonId && (
                            <BodyControls 
                                data={moons[moonId]} 
                                onChange={(key, value) => setMoon(moonId, key, value)} 
                            />
                        )}
                    </div>
                ))}
            </div>
            
            {/* PARTICLES */}
            <div className="debug-panel__section">
                <SectionHeader id="particles" title="✨ Particles" color="#7cc4ed" />
                {expandedSection === 'particles' && (
                    <div className="debug-body-controls">
                        <Slider label="Stars" value={starsCount} onChange={setStarsCount} min={500} max={8000} step={500} />
                        <Slider label="Dust" value={dustCount} onChange={setDustCount} min={500} max={8000} step={500} />
                        <div className="debug-particles-total">
                            Total: {starsCount + dustCount} particles
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
