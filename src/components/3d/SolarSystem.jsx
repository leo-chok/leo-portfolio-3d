import { GALAXY_MAP, SIZES, COLORS, INTENSITY } from '../../config/galaxyConfig'
import { Sun } from './Sun'
import { CelestialBody } from './CelestialBody'
import { OrbitingBody } from './OrbitingBody'

/**
 * SolarSystem Component - Main orchestrator
 * Renders the entire galaxy structure from galaxyConfig
 * 
 * Note: Camera navigation is handled by CameraController
 * This component only renders the celestial bodies
 */
export const SolarSystem = () => {
    return (
        <group>
            {/* ====== SUN (Présentation) ====== */}
            <Sun 
                name={GALAXY_MAP.sun.name}
                position={GALAXY_MAP.sun.position}
            />

            {/* ====== PLANETS ====== */}
            {GALAXY_MAP.planets.map((planet) => (
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
                        color={planet.color}
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
                                    color={COLORS.moon}
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

