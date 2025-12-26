# 🎮 Space Game Module

## Overview
Mini-game reward after completing the portfolio exploration. Players pilot their spaceship through the solar system.

## Architecture

```
game/
├── entities/
│   ├── player/        # SpaceshipController + 3D HUD
│   └── effects/       # EngineGlow, ShipDust, BarrierEffect
├── controllers/       # Input handling (keyboard, touch, gamepad)
├── ai/
│   └── behaviors/     # Enemy AI behaviors
├── systems/           # Global game systems (score, collision, waves)
├── hud/              # SpaceshipControls UI overlay
└── stores/           # Zustand stores for game state
```

---

## Current Status

### ✅ Completed
- [x] Basic spaceship controller with keyboard input
- [x] Engine glow and particle effects
- [x] 3D HUD around ship (ShipHUD3D, Crosshair)
- [x] Boundary system with slowdown (BarrierEffect)
- [x] SpaceshipControls hint overlay
- [x] **Folder architecture reorganization** ✨

### 📋 Backlog
- [ ] Extract keyboard input to separate hook (`useKeyboardInput.js`)
- [ ] Add virtual joystick for mobile (`useTouchInput.js`, `VirtualJoystick.jsx`)
- [ ] Enemy ships and AI
- [ ] Wave system (`WaveSystem.js`)
- [ ] Score system (`ScoreSystem.js`)
- [ ] Collision detection (`CollisionSystem.js`)
- [ ] Projectile system
- [ ] Health and damage

---

## Controls

### Desktop (Keyboard)
| Key | Action |
|-----|--------|
| ↑↓←→ | Pitch and Roll |
| SHIFT | Accelerate |
| CTRL | Brake |
| T | Exit game mode |

### Mobile (Planned)
| Control | Action |
|---------|--------|
| Left Joystick | Direction |
| Right Button | Accelerate |
| Tap Joystick | Brake |

---

## Technical Notes

### Physics
- Max speed: 1117 km/h (speed of sound)
- Acceleration: 280 km/h/s
- Brake: 400 km/h/s
- Quaternion-based rotation
- FPS-independent damping

### Performance
- Reusable THREE.js objects (no GC)
- Throttled store updates
- Priority -1 in useFrame (before camera)

---

## Troubleshooting

### 🔧 Camera Jitter/Stuttering in Spaceship Mode

**Symptom:** Ship appears to "jump" periodically at regular intervals while moving.

**Cause:** Frame-rate dependent `lerp()` for camera follow. Fixed lerp factor (e.g., `0.1`) causes inconsistent movement when frames take varying amounts of time.

**Solution:** Use frame-rate independent lerp with exponential smoothing:
```jsx
// ❌ BAD - Frame-rate dependent
camera.position.lerp(target, 0.1)

// ✅ GOOD - Frame-rate independent
const smoothing = 8 // Higher = tighter follow
const t = 1 - Math.exp(-smoothing * delta)
camera.position.lerp(target, t)
```

**Location:** `src/components/core/CameraController.jsx` (spaceship mode section)

---

## Changelog

### 2024-12-26
- ✅ Fixed camera jitter with frame-rate independent lerp
- ✅ Optimized BarrierEffect (getState instead of reactive selector)

### 2024-12-24
- ✅ Created game module folder structure
- ✅ Migrated spaceship files from `components/3d/ships`
- ✅ Migrated SpaceshipControls from `components/hud`
- ✅ Updated all imports in App.jsx, ExperiencePage.jsx, Experience.jsx, Mothership.jsx
- ✅ Deleted old files from components folders
