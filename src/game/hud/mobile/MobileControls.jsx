import { VirtualJoystick } from './VirtualJoystick'
import { SpeedSlider } from './SpeedSlider'
import { FireButton } from './FireButton'
import './MobileControls.css'

/**
 * MobileControls - Container for all mobile touch controls
 * 
 * Layout:
 * - Left: Virtual joystick for ship direction
 * - Right top: Fire button
 * - Right bottom: Speed slider
 */
export const MobileControls = () => {
    return (
        <div className="mobile-controls">
            {/* Left side - Direction joystick */}
            <div className="mobile-controls-left">
                <VirtualJoystick size={120} />
            </div>
            
            {/* Right side - Fire and Speed */}
            <div className="mobile-controls-right">
                <div className="mobile-controls-fire">
                    <FireButton size={70} />
                </div>
                <div className="mobile-controls-speed">
                    <SpeedSlider width={140} height={40} />
                </div>
            </div>
        </div>
    )
}
