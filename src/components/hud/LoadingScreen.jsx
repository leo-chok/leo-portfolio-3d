import { useState, useEffect, useRef } from 'react'
import './LoadingScreen.css'

/**
 * LoadingScreen - Futuristic System Initialization Screen
 * Simple fade out transition when complete
 */
export const LoadingScreen = ({ onComplete, onReadyToAnimate }) => {
    const [progress, setProgress] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)
    const [isFadingOut, setIsFadingOut] = useState(false)
    const startTimeRef = useRef(Date.now())
    const completedRef = useRef(false)
    
    // Loading duration in ms
    const LOADING_DURATION = 3500
    
    // System initialization steps
    const STEPS = [
        { id: 'boot', label: 'INITIALISATION SYSTÈME', sublabel: 'Core systems online' },
        { id: 'data', label: 'CHARGEMENT DES DONNÉES', sublabel: 'Loading celestial database' },
        { id: 'hud', label: 'AFFICHAGE DU HUD', sublabel: 'Holographic interface ready' },
        { id: 'scan', label: 'OUVERTURE ANALYSE', sublabel: 'Scanner calibration complete' },
        { id: 'ready', label: 'SYSTÈME OPÉRATIONNEL', sublabel: 'All systems nominal' },
    ]
    
    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current
            const newProgress = Math.min((elapsed / LOADING_DURATION) * 100, 100)
            
            setProgress(newProgress)
            
            // Update current step based on progress
            const stepIndex = Math.min(
                Math.floor(newProgress / (100 / STEPS.length)),
                STEPS.length - 1
            )
            setCurrentStep(stepIndex)
            
            // When complete, trigger animation then fade out
            if (newProgress >= 100 && !completedRef.current) {
                completedRef.current = true
                clearInterval(interval)
                
                // Short delay to show 100%, then start animation and fade
                setTimeout(() => {
                    // Start the camera animation NOW (before fade)
                    onReadyToAnimate?.()
                    
                    setIsFadingOut(true)
                    
                    // After fade animation, call onComplete
                    setTimeout(() => {
                        onComplete?.()
                    }, 800) // Match CSS fade duration
                }, 400)
            }
        }, 50)
        
        return () => clearInterval(interval)
    }, [onComplete])
    
    return (
        <div className={`loading-screen ${isFadingOut ? 'loading-screen--fadeout' : ''}`}>
            {/* Scanlines */}
            <div className="loading-screen__scanlines" />
            
            {/* Content */}
            <div className="loading-screen__content">
                {/* Logo */}
                <div className="loading-screen__header">
                    <div className="loading-screen__logo">
                        <span className="loading-screen__logo-brackets">[</span>
                        <span className="loading-screen__logo-text">PORTFOLIO</span>
                        <span className="loading-screen__logo-brackets">]</span>
                    </div>
                    <div className="loading-screen__version">v3.0.0 // STELLAR EDITION</div>
                </div>
                
                {/* Terminal */}
                <div className="loading-terminal">
                    <div className="loading-terminal__header">
                        <span className="loading-terminal__dot loading-terminal__dot--red" />
                        <span className="loading-terminal__dot loading-terminal__dot--yellow" />
                        <span className="loading-terminal__dot loading-terminal__dot--green" />
                        <span className="loading-terminal__title">SYSTEM BOOTSTRAP</span>
                    </div>
                    
                    <div className="loading-terminal__body">
                        {STEPS.map((step, index) => (
                            <div 
                                key={step.id}
                                className={`loading-step ${
                                    index < currentStep ? 'loading-step--done' : 
                                    index === currentStep ? 'loading-step--active' : ''
                                }`}
                            >
                                <span className="loading-step__prefix">
                                    {index < currentStep ? '✓' : index === currentStep ? '›' : '○'}
                                </span>
                                <span className="loading-step__label">{step.label}</span>
                                <span className="loading-step__sublabel">{step.sublabel}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Progress bar */}
                <div className="loading-progress">
                    <div className="loading-progress__bar">
                        <div 
                            className="loading-progress__fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="loading-progress__info">
                        <span className="loading-progress__percent">{Math.round(progress)}%</span>
                        <span className="loading-progress__status">
                            {progress >= 100 ? 'SYSTEM READY' : 'LOADING...'}
                        </span>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="loading-screen__footer">
                    <div className="loading-footer__line" />
                    <span className="loading-footer__text">STELLAR NAVIGATION SYSTEM</span>
                    <div className="loading-footer__line" />
                </div>
            </div>
            
            {/* Corner brackets */}
            <div className="loading-bracket loading-bracket--tl" />
            <div className="loading-bracket loading-bracket--tr" />
            <div className="loading-bracket loading-bracket--bl" />
            <div className="loading-bracket loading-bracket--br" />
        </div>
    )
}
