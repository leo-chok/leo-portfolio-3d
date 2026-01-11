import { create } from 'zustand'

/**
 * Mobile Input Store - Touch input state for mobile controls
 * 
 * Used by:
 * - VirtualJoystick (updates leftStick)
 * - SpeedSlider (updates speedPercent)
 * - FireButton (updates isFiring)
 * - SpaceshipController (reads all values)
 */
export const useMobileInputStore = create((set, get) => ({
    // Left joystick direction (-1 to 1)
    leftStick: { x: 0, y: 0 },
    
    // Speed slider (0 to 1)
    speedPercent: 0,
    
    // Fire button state
    isFiring: false,
    
    // Is touch device detected
    isTouchActive: false,
    
    // Actions
    setLeftStick: (x, y) => set({ leftStick: { x, y } }),
    
    setSpeedPercent: (percent) => set({ 
        speedPercent: Math.max(0, Math.min(1, percent)) 
    }),
    
    setFiring: (firing) => set({ isFiring: firing }),
    
    setTouchActive: (active) => set({ isTouchActive: active }),
    
    // Reset all inputs (when exiting spaceship mode)
    reset: () => set({
        leftStick: { x: 0, y: 0 },
        speedPercent: 0,
        isFiring: false
    })
}))
