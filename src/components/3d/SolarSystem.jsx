import { GALAXY_MAP, SIZES, INTENSITY } from '../../config/galaxyConfig'
import { Sun } from './Sun'
import { CelestialBody } from './CelestialBody'
import { OrbitingBody } from './OrbitingBody'
import { useDebugStore, hueToColor } from '../../stores/debugStore'

/**
 * SolarSystem Component - Main orchestrator
 * Renders the entire galaxy structure from galaxyConfig
 * Colors controlled by HUE values from debug store
 */
export const SolarSystem = () => {
    // Get HUE values for dynamic colors
    const planetHue1 = useDebugStore(state => state.planetHue1)
    const planetHue2 = useDebugStore(state => state.planetHue2)
    const moonHue = useDebugStore(state => state.moonHue)
    
    // Map planet index to HUE
    const getPlanetColor = (index) => {
        const hues = [planetHue1, planetHue2]
        return hueToColor(hues[index] || planetHue1, 70, 60)
    }
    
    // All moons share the same HUE
    const moonColor = hueToColor(moonHue, 60, 65)
    
    return (
        <group>
            {/* ====== SUN (Présentation) ====== */}
            <Sun 
                name={GALAXY_MAP.sun.name}
                position={GALAXY_MAP.sun.position}
            />

            {/* ====== PLANETS ====== */}
            {GALAXY_MAP.planets.map((planet, planetIndex) => (
                <OrbitingBody
                    key={planet.id}
                    orbitRadius={planet.orbitRadius}
                    orbitSpeed={planet.orbitSpeed}
                    orbitPlane={planet.orbitPlane}
                    showOrbitRing={true}
                >
                    <CelestialBody
                        id={planet.id}
                        name={planet.name}
                        size={planet.size}
                        color={getPlanetColor(planetIndex)}
                        intensity={planet.intensity}
                    >
                        {/* ====== MOONS ====== */}
                        {planet.moons?.map((moon, moonIndex) => (
                            <OrbitingBody
                                key={moon.id || moonIndex}
                                orbitRadius={moon.orbitRadius}
                                orbitSpeed={moon.orbitSpeed}
                                orbitPlane={{ tilt: moonIndex * 20, rotation: moonIndex * 45 }}
                                showOrbitRing={true}
                                initialAngle={(moonIndex / planet.moons.length) * Math.PI * 2}
                            >
                                <CelestialBody
                                    name={moon.name}
                                    size={SIZES.moon}
                                    color={moonColor}
                                    intensity={INTENSITY.moon}
                                    satellites={moon.satellites || []}
                                />
                            </OrbitingBody>
                        ))}
                    </CelestialBody>
                </OrbitingBody>
            ))}
        </group>
    )
}
