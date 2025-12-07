import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html, Billboard, Text } from '@react-three/drei'
import { COLORS, SIZES, INTENSITY } from '../../config/galaxyConfig'

// FontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faReact, faNodeJs, faJs, faHtml5, faCss3Alt, 
    faDocker, faGithub, faLinkedin, faTwitter 
} from '@fortawesome/free-brands-svg-icons'
import { 
    faRobot, faCode, faServer, faUsers, faComments, 
    faLightbulb, faHandshake, faBrain, faClock, faChartLine, faHeart 
} from '@fortawesome/free-solid-svg-icons'

// Icon mapping
const ICON_MAP = {
    // Brands
    'react': faReact,
    'node-js': faNodeJs,
    'js': faJs,
    'html5': faHtml5,
    'css3-alt': faCss3Alt,
    'docker': faDocker,
    'github': faGithub,
    'linkedin': faLinkedin,
    'twitter': faTwitter,
    // Solid
    'robot': faRobot,
    'code': faCode,
    'server': faServer,
    'users': faUsers,
    'comments': faComments,
    'lightbulb': faLightbulb,
    'handshake': faHandshake,
    'brain': faBrain,
    'clock': faClock,
    'chart-line': faChartLine,
    'heart': faHeart,
}

/**
 * Satellite Component - Tiny orbiting bodies with FontAwesome icons
 * Uses electron-style tilted orbital planes
 */
export const Satellite = ({ 
    name, 
    icon,
    orbitRadius = 1.5, 
    orbitSpeed = 0.5,
    orbitTilt = { x: 0, y: 0 },
    initialAngle = 0,
    onClick 
}) => {
    const orbitRef = useRef()
    const orbitAngle = useRef(initialAngle)
    const [hovered, setHovered] = useState(false)
    
    const color = COLORS.hud
    
    // Convert tilt to radians
    const tiltXRad = (orbitTilt.x * Math.PI) / 180
    const tiltYRad = (orbitTilt.y * Math.PI) / 180
    
    useFrame((state, delta) => {
        // Rotate the orbit group
        if (orbitRef.current) {
            orbitAngle.current += orbitSpeed * delta
            orbitRef.current.rotation.y = orbitAngle.current
        }
    })
    
    const faIcon = ICON_MAP[icon]
    
    return (
        // Tilted orbital plane
        <group rotation={[tiltXRad, tiltYRad, 0]}>
            {/* Orbit rotation group */}
            <group ref={orbitRef}>
                {/* Body positioned at radius */}
                <group position={[orbitRadius, 0, 0]}>
                    {/* Icon rendered as HTML in 3D space */}
                    <Html
                        center
                        sprite
                        transform
                        scale={0.15}
                        style={{
                            pointerEvents: 'auto',
                            cursor: 'pointer',
                        }}
                    >
                        <div
                            onClick={(e) => { e.stopPropagation(); onClick?.() }}
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                            style={{
                                color: hovered ? '#ffffff' : color,
                                fontSize: '24px',
                                filter: `drop-shadow(0 0 ${hovered ? '10px' : '5px'} ${color})`,
                                transition: 'all 0.2s ease',
                                transform: hovered ? 'scale(1.3)' : 'scale(1)',
                            }}
                        >
                            {faIcon && <FontAwesomeIcon icon={faIcon} />}
                        </div>
                    </Html>
                    
                    {/* Point light for glow */}
                    <pointLight 
                        color={color} 
                        intensity={hovered ? INTENSITY.satellite * 2 : INTENSITY.satellite} 
                        distance={2} 
                        decay={2} 
                    />
                    
                    {/* Label on hover */}
                    {hovered && (
                        <Billboard position={[0, 0.4, 0]}>
                            <Text
                                fontSize={0.15}
                                color={COLORS.hud}
                                anchorX="center"
                                anchorY="bottom"
                                font="/fonts/Orbitron-Bold.ttf"
                            >
                                {name}
                            </Text>
                        </Billboard>
                    )}
                </group>
            </group>
        </group>
    )
}
