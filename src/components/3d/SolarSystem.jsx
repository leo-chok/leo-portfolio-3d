import { useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import { GALAXY_MAP, SIZES, COLORS, INTENSITY } from '../../config/galaxyConfig'
import { Sun } from './Sun'
import { CelestialBody } from './CelestialBody'
import { OrbitingBody } from './OrbitingBody'

/**
 * SolarSystem Component - Main orchestrator
 * Renders the entire galaxy structure from galaxyConfig
 */
export const SolarSystem = () => {
    const { camera } = useThree()
    const controls = useThree((state) => state.controls)

    // Navigation handler - only handles return to overview
    // Approach to element is handled by CameraController
    const navigateTo = (worldPosition, bodySize = 1.5) => {
        if (!controls) return

        // Return to overview if no position (toggle off)
        if (!worldPosition) {
            controls.autoRotate = false
            
            const duration = 2
            const tl = gsap.timeline()
            
            // Fly back to overview position
            tl.to(camera.position, {
                x: 0,
                y: 20,
                z: 60,
                duration: duration,
                ease: "power3.inOut"
            }, 0)
            
            tl.to(controls.target, {
                x: 0,
                y: 0,
                z: 0,
                duration: duration,
                ease: "power3.inOut",
                onUpdate: () => controls.update()
            }, 0)
            
            tl.call(() => {
                controls.autoRotate = true
                controls.autoRotateSpeed = 0.3
            }, null, duration)
            
            return
        }

        // For element approach: just disable autoRotate
        // CameraController handles the smooth flight to real-time position
        controls.autoRotate = false
    }

    return (
        <group>
            {/* ====== SUN (Présentation) ====== */}
            <Sun 
                name={GALAXY_MAP.sun.name}
                position={GALAXY_MAP.sun.position}
                onClick={(worldPos, size) => navigateTo(worldPos, size)}
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
                        onClick={(worldPos, size) => navigateTo(worldPos, size)}
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
                                    onClick={(worldPos, size) => navigateTo(worldPos, size)}
                                />
                            </OrbitingBody>
                        ))}
                    </CelestialBody>
                </OrbitingBody>
            ))}
        </group>
    )
}
