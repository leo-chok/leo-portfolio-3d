/**
 * Galaxy Configuration
 * Central data structure for the entire solar system hierarchy
 */

// Color palette - New palette
export const COLORS = {
    sun: '#7cc4ed',      // Bright sky blue (accent)
    planet: '#6b9b9e',   // Muted teal/cyan
    moon: '#c6d8d3',     // Pale mint/green
    satellite: '#7cc4ed', // Sky blue for icons
    hud: '#7cc4ed',      // HUD elements
    background: '#283447', // Dark navy (dominant)
}

// Luminosity settings by hierarchy level
export const INTENSITY = {
    sun: 3,
    planet: 4,
    moon: 3,
    satellite: 2,
}

// Size multipliers (relative to base unit)
export const SIZES = {
    sun: 8,        // 3x larger than planets
    planet: 2,   // Base size
    moon: 0.5,     // 3x smaller than planets
    satellite: 0.5, // 3x smaller than moons
}

// Orbital configuration for "electron" effect
export const ORBITAL_PLANES = {
    portfolio: { tilt: 15, rotation: 0 },
    skills: { tilt: 45, rotation: 90 },
    contact: { tilt: 30, rotation: 180 },
    platforms: { tilt: 60, rotation: 270 },
}

// Seeded random for consistent colors
const seededRandom = (seed) => {
    const x = Math.sin(seed * 9999) * 10000
    return x - Math.floor(x)
}

// Generate subtle blue-ish color variations (hue 180-240)
const generateColor = (seed) => {
    const hue = 180 + seededRandom(seed) * 60 // 180 (cyan) to 240 (blue)
    const saturation = 30 + seededRandom(seed + 1) * 25 // 30-55% (subtle)
    const lightness = 60 + seededRandom(seed + 2) * 15 // 60-75% (luminous)
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// Main galaxy structure
export const GALAXY_MAP = {
    sun: {
        id: 'presentation',
        name: 'PRÉSENTATION',
        position: [0, 0, 0],
        size: SIZES.sun,
        color: COLORS.sun,
        intensity: INTENSITY.sun,
        description: 'Bienvenue dans mon univers',
    },
    
    planets: [
        {
            id: 'portfolio',
            name: 'PORTFOLIO',
            orbitRadius: 20,
            orbitSpeed: 0.08,
            orbitPlane: ORBITAL_PLANES.portfolio,
            size: SIZES.planet,
            color: generateColor(1),
            intensity: INTENSITY.planet,
            moons: [
                { id: 'projet1', name: 'Projet 1', orbitRadius: 4, orbitSpeed: 0.3, color: generateColor(11) },
                { id: 'projet2', name: 'Projet 2', orbitRadius: 5.5, orbitSpeed: 0.25, color: generateColor(12) },
                { id: 'projet3', name: 'Projet 3', orbitRadius: 7, orbitSpeed: 0.2, color: generateColor(13) },
            ]
        },
        {
            id: 'skills',
            name: 'SKILLS',
            orbitRadius: 35,
            orbitSpeed: 0.05,
            orbitPlane: ORBITAL_PLANES.skills,
            size: SIZES.planet,
            color: generateColor(2),
            intensity: INTENSITY.planet,
            moons: [
                { 
                    id: 'hardskills', 
                    name: 'Hardskills', 
                    orbitRadius: 6, 
                    orbitSpeed: 0.01,
                    color: generateColor(21),
                    satellites: [
                        { icon: 'react', name: 'React', type: 'brand' },
                        { icon: 'node-js', name: 'Node.js', type: 'brand' },
                        { icon: 'js', name: 'JavaScript', type: 'brand' },
                        { icon: 'html5', name: 'HTML5', type: 'brand' },
                        { icon: 'css3-alt', name: 'CSS3', type: 'brand' },
                        { icon: 'docker', name: 'Docker', type: 'brand' },
                        { icon: 'github', name: 'GitHub', type: 'brand' },
                        { icon: 'robot', name: 'IA', type: 'solid' },
                        { icon: 'code', name: 'TypeScript', type: 'solid' },
                        { icon: 'server', name: 'Express', type: 'solid' },
                    ]
                },
                { 
                    id: 'softskills', 
                    name: 'Softskills', 
                    orbitRadius: 14, 
                    orbitSpeed: 0.001,
                    color: generateColor(22),
                    satellites: [
                        { icon: 'users', name: 'Leadership' },
                        { icon: 'comments', name: 'Communication' },
                        { icon: 'lightbulb', name: 'Créativité' },
                        { icon: 'handshake', name: 'Collaboration' },
                        { icon: 'brain', name: 'Problem Solving' },
                        { icon: 'clock', name: 'Gestion du temps' },
                        { icon: 'chart-line', name: 'Analytique' },
                        { icon: 'heart', name: 'Empathie' },
                    ]
                },
            ]
        },
        {
            id: 'contact',
            name: 'CONTACT',
            orbitRadius: 50,
            orbitSpeed: 0.03,
            orbitPlane: ORBITAL_PLANES.contact,
            size: SIZES.planet,
            color: generateColor(3),
            intensity: INTENSITY.planet,
            hasModal: true,
            moons: []
        },
        {
            id: 'platforms',
            name: 'MY PLATFORMS',
            orbitRadius: 65,
            orbitSpeed: 0.02,
            orbitPlane: ORBITAL_PLANES.platforms,
            size: SIZES.planet,
            color: generateColor(4),
            intensity: INTENSITY.planet,
            moons: [
                { id: 'github', name: 'GitHub', icon: 'github', url: 'https://github.com', color: generateColor(41) },
                { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com', color: generateColor(42) },
                { id: 'twitter', name: 'Twitter', icon: 'twitter', url: 'https://twitter.com', color: generateColor(43) },
            ]
        },
    ]
}
