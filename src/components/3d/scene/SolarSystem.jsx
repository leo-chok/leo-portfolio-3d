import { GALAXY_MAP } from '../../../config/galaxyConfig'
import { Sun } from './Sun'
import { CelestialBody } from './CelestialBody'
import { OrbitingBody } from './OrbitingBody'
import { AsteroidBelt } from './AsteroidBelt'
import { MoonTom } from './MoonTom'
import { useDebugStore, hueToColor } from '../../../stores/debugStore'

/**
 * SolarSystem Component - Main orchestrator
 * Renders the entire galaxy structure
 * Uses debug store for real-time customization
 */
export const SolarSystem = () => {
    // Get debug values
    const planets = useDebugStore(state => state.planets)
    const moons = useDebugStore(state => state.moons)
    
    return (
        <group>
            {/* ====== SUN (Présentation) ====== */}
            <Sun 
                name={GALAXY_MAP.sun.name}
                position={GALAXY_MAP.sun.position}
            />
            
            {/* ====== ASTEROID BELT ====== */}
            <AsteroidBelt />

            {/* ====== PLANETS ====== */}
            {GALAXY_MAP.planets.map((planet, planetIndex) => {
                const planetDebug = planets[planet.id] || {}
                // Planets: saturated blue colors
                const planetColor = hueToColor(planetDebug.hue || 200, 70, 60)
                // Random starting position on orbit (different each refresh)
                const planetInitialAngle = Math.random() * Math.PI * 2
                
                return (
                    <OrbitingBody
                        key={planet.id}
                        orbitRadius={planetDebug.orbitRadius || 20}
                        orbitSpeed={planet.orbitSpeed}
                        orbitPlane={{ tilt: planetDebug.orbitTilt || 0, rotation: 0 }}
                        showOrbitRing={true}
                        initialAngle={planetInitialAngle}
                    >
                        <CelestialBody
                            id={planet.id}
                            name={planet.name}
                            size={planetDebug.size || 2}
                            color={planetColor}
                            intensity={4}
                        >
                            {/* ====== MOONS ====== */}
                            {planet.moons?.map((moon, moonIndex) => {
                                const moonDebug = moons[moon.id] || {}
                                // Moons: low saturation = grey/white
                                const moonSaturation = moonDebug.saturation || 10
                                const moonColor = hueToColor(moonDebug.hue || 0, moonSaturation, 75)
                                
                                // Check if moon uses a custom 3D model
                                const hasCustomModel = moon.customModel || moonDebug.customModel
                                
                                return (
                                    <OrbitingBody
                                        key={moon.id || moonIndex}
                                        orbitRadius={moonDebug.orbitRadius || moon.orbitRadius || (5 + moonIndex * 2)}
                                        orbitSpeed={moon.orbitSpeed || 0.1}
                                        orbitPlane={{ 
                                            tilt: moonDebug.orbitTilt || (Math.random() * 60), 
                                            rotation: moonIndex * 72 
                                        }}
                                        showOrbitRing={true}
                                        initialAngle={(moonIndex / (planet.moons?.length || 1)) * Math.PI * 2}
                                    >
                                        {/* Use custom MoonTom component for moons with 3D models */}
                                        {hasCustomModel && moon.id === 'moon-tom' ? (
                                            <MoonTom
                                                id={moon.id}
                                                name={moon.name}
                                                size={moonDebug.size || 0.8}
                                            />
                                        ) : (
                                            <CelestialBody
                                                id={moon.id}
                                                name={moon.name}
                                                size={moonDebug.size || 0.3}
                                                color={moonColor}
                                                intensity={3}
                                                satellites={moon.satellites || []}
                                                projectData={moon.projectData}
                                            />
                                        )}
                                    </OrbitingBody>
                                )
                            })}
                        </CelestialBody>
                    </OrbitingBody>
                )
            })}
        </group>
    )
}
