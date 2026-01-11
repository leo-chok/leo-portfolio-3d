/**
 * Galaxy Configuration
 * Central data structure for the entire solar system hierarchy
 * 
 * Structure:
 * - 1 Sun (Présentation) - Size 15
 * - 4 Planets on same orbital plane (0°)
 * - 7 Moons with chaotic orbits around their parents
 */

import { projects } from '../data/projects'

// ============================================
// RANDOM GENERATORS (refresh = new random)
// ============================================

// Random blue hue for planets (180-240 = cyan to blue)
const randomBlueHue = () => 180 + Math.random() * 60

// Random grey/white for moons (low saturation, high lightness)
const randomGreyHue = () => Math.random() * 360 // Any hue but low saturation makes it grey

// Random moon orbit radius (proportional to parent, max 20)
const randomMoonOrbit = (min = 3, max = 20) => min + Math.random() * (max - min)

// Random moon orbit tilt (chaotic, 0-90°)
const randomMoonTilt = () => Math.random() * 90

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULTS = {
    // Sun - The biggest element
    sun: {
        hue: 40, // Warm orange/yellow
        size: 30,
    },
    
    // Planets - All on same orbital plane (tilt 0)
    planets: {
        portfolio: { 
            hue: 30,  // Orange/warm
            size: 5, 
            orbitRadius: 130, 
            orbitTilt: 0 
        },
        formation: { 
            hue: 235, // Blue
            size: 3, 
            orbitRadius: 50, 
            orbitTilt: 0 
        },
        skills: { 
            hue: 160, // Cyan/teal
            size: 2.5, 
            orbitRadius: 80, 
            orbitTilt: 0 
        },
        contact: { 
            hue: 290, // Purple/violet
            size: 1.5, 
            orbitRadius: 160, 
            orbitTilt: 0 
        },
    },
    
    // Moons - All size 0.3, random orbits and tilts
    moons: {
        // Portfolio moons (5 projects)
        'moon-keepgoals': { 
            hue: randomGreyHue(), 
            saturation: 35, // More colorful
            size: 0.3, 
            orbitRadius: randomMoonOrbit(7, 12), 
            orbitTilt: randomMoonTilt() 
        },
        'moon-toothy': { 
            hue: randomGreyHue(), 
            saturation: 35,
            size: 0.3, 
            orbitRadius: randomMoonOrbit(12, 18), 
            orbitTilt: randomMoonTilt() 
        },
        'moon-jambonbeurre': { 
            hue: randomGreyHue(), 
            saturation: 35,
            size: 0.3, 
            orbitRadius: randomMoonOrbit(7, 16), 
            orbitTilt: randomMoonTilt() 
        },
        'moon-pokedex': { 
            hue: randomGreyHue(), 
            saturation: 35,
            size: 0.3, 
            orbitRadius: randomMoonOrbit(8, 18), 
            orbitTilt: randomMoonTilt() 
        },
        'moon-clickit': { 
            hue: randomGreyHue(), 
            saturation: 35,
            size: 0.3, 
            orbitRadius: randomMoonOrbit(8, 20), 
            orbitTilt: randomMoonTilt() 
        },
        // Skills moons (2)
        'moon-hardskills': { 
            hue: randomGreyHue(), 
            saturation: 35,
            size: 0.3, 
            orbitRadius: randomMoonOrbit(3, 8), 
            orbitTilt: randomMoonTilt() 
        },
        'moon-softskills': { 
            hue: randomGreyHue(), 
            saturation: 35,
            size: 0.3, 
            orbitRadius: randomMoonOrbit(4, 10), 
            orbitTilt: randomMoonTilt() 
        },
    }
}

// Color palette (legacy)
export const COLORS = {
    sun: '#7cc4ed',
    planet: '#6b9b9e',
    moon: '#c6d8d3',
    satellite: '#7cc4ed',
    hud: '#7cc4ed',
    background: '#283447',
}

// Luminosity settings
export const INTENSITY = {
    sun: 9,
    planet: 8,
    moon: 3,
    satellite: 2,
}

// Legacy sizes
export const SIZES = {
    sun: 15,
    planet: 2.5,
    moon: 0.3,
    satellite: 0.5,
}

// Helper to convert HUE to HSL color (supports custom saturation)
export const hueToHSL = (hue, saturation = 70, lightness = 60) => {
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// Generate project moons from data
const generateProjectMoons = () => {
    return projects.map((project, index) => ({
        id: `moon-${project.id}`,
        name: project.title,
        projectData: project,
        orbitRadius: DEFAULTS.moons[`moon-${project.id}`]?.orbitRadius || (5 + index * 2),
        orbitSpeed: 0.08 + Math.random() * 0.05,
    }))
}

// Main galaxy structure
export const GALAXY_MAP = {
    sun: {
        id: 'presentation',
        name: 'PRÉSENTATION',
        position: [0, 0, 0],
        description: 'Bienvenue dans mon univers',
    },
    
    planets: [
        {
            id: 'formation',
            name: 'FORMATION',
            orbitSpeed: 0.03,
            moons: [],
        },
        {
            id: 'skills',
            name: 'COMPÉTENCES',
            orbitSpeed: 0.025,
            moons: [
                { 
                    id: 'moon-hardskills', 
                    name: 'Hardskills', 
                    orbitSpeed: 0.08 + Math.random() * 0.04,
                    satellites: [
                        { icon: 'react', name: 'React', type: 'brand' },
                        { icon: 'node-js', name: 'Node.js', type: 'brand' },
                        { icon: 'js', name: 'JavaScript', type: 'brand' },
                        { icon: 'html5', name: 'HTML5', type: 'brand' },
                        { icon: 'css3-alt', name: 'CSS3', type: 'brand' },
                        { icon: 'docker', name: 'Docker', type: 'brand' },
                        { icon: 'github', name: 'GitHub', type: 'brand' },
                    ]
                },
                { 
                    id: 'moon-softskills', 
                    name: 'Softskills', 
                    orbitSpeed: 0.06 + Math.random() * 0.04,
                    satellites: [
                        { icon: 'users', name: 'Leadership' },
                        { icon: 'comments', name: 'Communication' },
                        { icon: 'lightbulb', name: 'Créativité' },
                        { icon: 'handshake', name: 'Collaboration' },
                        { icon: 'brain', name: 'Problem Solving' },
                    ]
                },
            ]
        },
        {
            id: 'portfolio',
            name: 'PORTFOLIO',
            orbitSpeed: 0.02,
            moons: generateProjectMoons(),
        },
        {
            id: 'contact',
            name: 'CONTACT',
            orbitSpeed: 0.015,
            hasModal: true,
            moons: [],
        },
    ]
}
