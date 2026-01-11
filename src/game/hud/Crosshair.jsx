import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../stores/gameStore'

/**
 * Crosshair - Sci-fi targeting reticle with auto-aim
 * 
 * Design:
 * - Center: Cross + small circle (fixed, slow lerp to target)
 * - Middle: Complete ring (fixed)
 * - Outer: 3 rotating arcs (fast lerp to target, thicker)
 * 
 * Colors: Blue (idle) → Orange (targeting) → Red (firing)
 */
export const Crosshair = ({ shipRef }) => {
    // Refs
    const outerGroupRef = useRef()
    const centerGroupRef = useRef()
    const arcsGroupRef = useRef() // For rotation
    const middleRingRef = useRef() // For scaling with arcs
    
    const rotationRef = useRef(0)
    const scaleRef = useRef(1)
    const isFiringRef = useRef(false)
    const firingTimerRef = useRef(0)
    
    // Position tracking
    const outerPositionRef = useRef(new THREE.Vector3(0, 0.012, -1.5))
    const centerPositionRef = useRef(new THREE.Vector3(0, 0.012, -1.5))
    const targetPositionRef = useRef(new THREE.Vector3(0, 0.012, -1.5))
    
    const [isTracking, setIsTracking] = useState(false)
    const [isFiring, setIsFiring] = useState(false)
    
    // Config
    const BASE_Y = 0.09 // Offset to align with laser trajectory
    const BASE_Z = -1.5
    const OUTER_LERP_SPEED = 12
    const CENTER_LERP_SPEED = 4
    const ROTATION_SPEED_IDLE = 0.2
    const ROTATION_SPEED_TRACKING = 1.5
    
    // Colors - HUD blue, orange targeting, red firing
    const COLOR_IDLE = '#00aaff'      // HUD blue
    const COLOR_TRACKING = '#ff8800'  // Orange
    const COLOR_FIRING = '#ff2222'    // Red
    
    const lastLaserCount = useRef(0)
    
    useFrame((state, delta) => {
        if (!outerGroupRef.current || !centerGroupRef.current || !arcsGroupRef.current) return
        
        const lasers = useGameStore.getState().lasers
        const playerLasers = lasers.filter(l => l.owner === 'player')
        
        // === FIRE DETECTION (only player lasers) ===
        if (playerLasers.length > lastLaserCount.current) {
            scaleRef.current = 1.2
            isFiringRef.current = true
            firingTimerRef.current = 0.15 // Red flash duration
            setIsFiring(true)
        }
        lastLaserCount.current = playerLasers.length
        
        // Firing timer
        if (firingTimerRef.current > 0) {
            firingTimerRef.current -= delta
            if (firingTimerRef.current <= 0) {
                isFiringRef.current = false
                setIsFiring(false)
            }
        }
        
        // Scale return
        scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 1, delta * 8)
        
        // === AUTO-AIM DETECTION ===
        let hasTarget = false
        let closestEnemy = null
        let closestDistance = Infinity
        
        const enemyRefs = useGameStore.getState().enemyRefs
        const AUTO_AIM_ANGLE = Math.cos(THREE.MathUtils.degToRad(30)) // 30° cone
        const AUTO_AIM_RANGE = 80 // Extended range for long-distance targeting
        
        if (shipRef?.current) {
            const shipPos = shipRef.current.position
            const shipForward = new THREE.Vector3(0, 0, -1)
            shipForward.applyQuaternion(shipRef.current.quaternion)
            
            for (const [enemyId, enemyRef] of Object.entries(enemyRefs)) {
                if (!enemyRef?.current) continue
                
                const enemyPos = enemyRef.current.position
                const toEnemy = new THREE.Vector3(
                    enemyPos.x - shipPos.x,
                    enemyPos.y - shipPos.y,
                    enemyPos.z - shipPos.z
                )
                const distance = toEnemy.length()
                
                if (distance > AUTO_AIM_RANGE) continue
                
                // Check if in cone
                toEnemy.normalize()
                const dot = shipForward.dot(toEnemy)
                
                if (dot > AUTO_AIM_ANGLE && distance < closestDistance) {
                    closestDistance = distance
                    closestEnemy = enemyRef
                    hasTarget = true
                }
            }
        }
        
        // Store auto-aim direction for laser firing
        if (hasTarget && closestEnemy && shipRef?.current) {
            const enemyPos = closestEnemy.current.position
            const shipPos = shipRef.current.position
            const direction = new THREE.Vector3(
                enemyPos.x - shipPos.x,
                enemyPos.y - shipPos.y,
                enemyPos.z - shipPos.z
            ).normalize()
            
            useGameStore.getState().setAutoAimTarget({ direction })
        } else {
            useGameStore.getState().setAutoAimTarget(null)
        }
        
        if (hasTarget !== isTracking) {
            setIsTracking(hasTarget)
        }
        
        if (hasTarget && closestEnemy && shipRef?.current) {
            // Project enemy position to crosshair plane
            const enemyWorld = closestEnemy.current.position.clone()
            const shipPos = shipRef.current.position
            const toEnemy = enemyWorld.clone().sub(shipPos)
            
            // Convert to local ship space for crosshair offset
            const localEnemy = toEnemy.clone()
            localEnemy.applyQuaternion(shipRef.current.quaternion.clone().invert())
            
            // Scale down for crosshair plane distance
            const scale = Math.abs(BASE_Z) / Math.max(0.1, -localEnemy.z)
            targetPositionRef.current.set(
                localEnemy.x * scale * 0.8,
                localEnemy.y * scale * 0.8 + BASE_Y,
                BASE_Z
            )
        } else {
            targetPositionRef.current.set(0, BASE_Y, BASE_Z)
        }
        
        // === ROTATION (apply imperatively) ===
        const rotSpeed = hasTarget ? ROTATION_SPEED_TRACKING : ROTATION_SPEED_IDLE
        rotationRef.current += delta * rotSpeed
        arcsGroupRef.current.rotation.z = rotationRef.current
        
        // === POSITION LERP ===
        outerPositionRef.current.lerp(targetPositionRef.current, delta * OUTER_LERP_SPEED)
        outerGroupRef.current.position.copy(outerPositionRef.current)
        
        centerPositionRef.current.lerp(targetPositionRef.current, delta * CENTER_LERP_SPEED)
        centerGroupRef.current.position.copy(centerPositionRef.current)
        
        // Scale - only outer arcs and middle ring
        const s = scaleRef.current
        outerGroupRef.current.scale.set(s, s, 1)
        if (middleRingRef.current) {
            middleRingRef.current.scale.set(s, s, 1)
        }
        // centerGroup (cross + dot) stays at scale 1
    })
    
    // Color logic
    const color = isFiring ? COLOR_FIRING : (isTracking ? COLOR_TRACKING : COLOR_IDLE)
    
    // === GEOMETRIES ===
    const size = 0.035 // Reduced overall size
    
    // Center cross
    const crossVerticalGeometry = useMemo(() => {
        const len = size * 0.5
        const gap = size * 0.15
        const points = [
            new THREE.Vector3(0, gap, 0),
            new THREE.Vector3(0, len, 0),
        ]
        return new THREE.BufferGeometry().setFromPoints(points)
    }, [size])
    
    const crossVerticalGeometry2 = useMemo(() => {
        const len = size * 0.5
        const gap = size * 0.15
        const points = [
            new THREE.Vector3(0, -gap, 0),
            new THREE.Vector3(0, -len, 0),
        ]
        return new THREE.BufferGeometry().setFromPoints(points)
    }, [size])
    
    const crossHorizontalGeometry = useMemo(() => {
        const len = size * 0.5
        const gap = size * 0.15
        const points = [
            new THREE.Vector3(gap, 0, 0),
            new THREE.Vector3(len, 0, 0),
        ]
        return new THREE.BufferGeometry().setFromPoints(points)
    }, [size])
    
    const crossHorizontalGeometry2 = useMemo(() => {
        const len = size * 0.5
        const gap = size * 0.15
        const points = [
            new THREE.Vector3(-gap, 0, 0),
            new THREE.Vector3(-len, 0, 0),
        ]
        return new THREE.BufferGeometry().setFromPoints(points)
    }, [size])
    
    // Center dot
    const centerDotGeometry = useMemo(() => {
        const points = []
        const r = size * 0.08
        for (let i = 0; i <= 16; i++) {
            const angle = (i / 16) * Math.PI * 2
            points.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0))
        }
        return new THREE.BufferGeometry().setFromPoints(points)
    }, [size])
    
    // Middle ring
    const middleRingGeometry = useMemo(() => {
        const points = []
        const r = size * 0.8
        for (let i = 0; i <= 48; i++) {
            const angle = (i / 48) * Math.PI * 2
            points.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0))
        }
        return new THREE.BufferGeometry().setFromPoints(points)
    }, [size])
    
    // Outer arcs (3 segments, ~100° each) - THICKER using tube-like approach
    const createArcPoints = (radius, arcDeg, offsetDeg) => {
        const points = []
        const arcAngle = THREE.MathUtils.degToRad(arcDeg)
        const offset = THREE.MathUtils.degToRad(offsetDeg)
        const segments = 24
        
        for (let i = 0; i <= segments; i++) {
            const angle = offset - arcAngle / 2 + (i / segments) * arcAngle
            points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
        }
        return points
    }
    
    const outerRadius = size * 1.8
    const arcAngle = 100 // degrees
    
    // Create arc geometries
    const arc1Geometry = useMemo(() => {
        return new THREE.BufferGeometry().setFromPoints(createArcPoints(outerRadius, arcAngle, 90))
    }, [outerRadius])
    
    const arc2Geometry = useMemo(() => {
        return new THREE.BufferGeometry().setFromPoints(createArcPoints(outerRadius, arcAngle, 210))
    }, [outerRadius])
    
    const arc3Geometry = useMemo(() => {
        return new THREE.BufferGeometry().setFromPoints(createArcPoints(outerRadius, arcAngle, 330))
    }, [outerRadius])
    
    // Inner lines of arcs (for thickness effect)
    const innerRadius = size * 1.6
    const arc1InnerGeometry = useMemo(() => {
        return new THREE.BufferGeometry().setFromPoints(createArcPoints(innerRadius, arcAngle, 90))
    }, [innerRadius])
    
    const arc2InnerGeometry = useMemo(() => {
        return new THREE.BufferGeometry().setFromPoints(createArcPoints(innerRadius, arcAngle, 210))
    }, [innerRadius])
    
    const arc3InnerGeometry = useMemo(() => {
        return new THREE.BufferGeometry().setFromPoints(createArcPoints(innerRadius, arcAngle, 330))
    }, [innerRadius])
    
    return (
        <>
            {/* OUTER GROUP - Fast lerp */}
            <group ref={outerGroupRef} position={[0, 0, BASE_Z]}>
                {/* Rotating arcs group */}
                <group ref={arcsGroupRef}>
                    {/* Outer arc lines */}
                    <line geometry={arc1Geometry}>
                        <lineBasicMaterial color={color} transparent opacity={0.9} />
                    </line>
                    <line geometry={arc2Geometry}>
                        <lineBasicMaterial color={color} transparent opacity={0.9} />
                    </line>
                    <line geometry={arc3Geometry}>
                        <lineBasicMaterial color={color} transparent opacity={0.9} />
                    </line>
                    
                    {/* Inner arc lines (thickness) */}
                    <line geometry={arc1InnerGeometry}>
                        <lineBasicMaterial color={color} transparent opacity={0.5} />
                    </line>
                    <line geometry={arc2InnerGeometry}>
                        <lineBasicMaterial color={color} transparent opacity={0.5} />
                    </line>
                    <line geometry={arc3InnerGeometry}>
                        <lineBasicMaterial color={color} transparent opacity={0.5} />
                    </line>
                </group>
            </group>
            
            {/* CENTER GROUP - Slow lerp, no scale */}
            <group ref={centerGroupRef} position={[0, 0, BASE_Z]}>
                {/* Middle ring - scales with fire */}
                <group ref={middleRingRef}>
                    <line geometry={middleRingGeometry}>
                        <lineBasicMaterial color={color} transparent opacity={0.4} />
                    </line>
                </group>
                
                {/* Cross (4 segments with gap) */}
                <line geometry={crossVerticalGeometry}>
                    <lineBasicMaterial color={color} transparent opacity={0.9} />
                </line>
                <line geometry={crossVerticalGeometry2}>
                    <lineBasicMaterial color={color} transparent opacity={0.9} />
                </line>
                <line geometry={crossHorizontalGeometry}>
                    <lineBasicMaterial color={color} transparent opacity={0.9} />
                </line>
                <line geometry={crossHorizontalGeometry2}>
                    <lineBasicMaterial color={color} transparent opacity={0.9} />
                </line>
                
                {/* Center dot */}
                <line geometry={centerDotGeometry}>
                    <lineBasicMaterial color={color} transparent opacity={0.7} />
                </line>
            </group>
        </>
    )
}
