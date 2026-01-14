import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useEffect } from 'react'
import { Loader } from '@react-three/drei'
import { Experience } from '../components/core/Experience'
import { CockpitHUD } from '../components/hud/CockpitHUD'
import { CockpitHUDMobile } from '../components/hud/CockpitHUDMobile'
import { WelcomeModal } from '../components/hud/components/WelcomeModal/WelcomeModal'
import { SpaceshipControls, DeathScreen } from '../game'
import { MobileControls } from '../game/hud/mobile'
import { DebugPanel } from '../components/hud/DebugPanel'
import { WindowManager } from '../components/hud/WindowManager'
import { Taskbar } from '../components/hud/common/Taskbar'
import { LoadingScreen } from '../components/hud/LoadingScreen'
import { useSpaceshipStore } from '../stores/spaceshipStore'
import { useIsMobile } from '../hooks/useIsMobile'

/**
 * ExperiencePage - Full 3D Interactive Experience
 * 
 * This is the original App component, renamed and adapted for routing.
 * Lazy loaded to avoid loading Three.js bundle on other pages.
 */
function ExperiencePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [canStartAnimation, setCanStartAnimation] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const isSpaceshipMode = useSpaceshipStore(state => state.isSpaceshipMode)
  const isDead = useSpaceshipStore(state => state.isDead)
  const enterSpaceshipMode = useSpaceshipStore(state => state.enterSpaceshipMode)
  const exitSpaceshipMode = useSpaceshipStore(state => state.exitSpaceshipMode)
  
  // Detect mobile viewport
  const isMobile = useIsMobile(768)
  
  // Auto-exit after 3 seconds when dead
  useEffect(() => {
    if (isDead) {
      const timer = setTimeout(() => {
        exitSpaceshipMode()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isDead, exitSpaceshipMode])
  
  // Global T key toggle for spaceship mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyT') {
        if (isSpaceshipMode) {
          exitSpaceshipMode()
        } else {
          enterSpaceshipMode()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSpaceshipMode, enterSpaceshipMode, exitSpaceshipMode])

  // Called when loading reaches 100% (before fade out)
  const handleReadyToAnimate = () => {
    setCanStartAnimation(true)
  }

  // Called after fade out is complete
  const handleLoadingComplete = () => {
    setIsLoading(false)
  }
  
  // Called when intro camera animation completes (Overview mode)
  const handleIntroComplete = () => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome')
    if (!hasSeenWelcome) {
      setShowWelcome(true)
    }
  }
  
  // Close welcome modal and save to session
  const handleCloseWelcome = () => {
    setShowWelcome(false)
    sessionStorage.setItem('hasSeenWelcome', 'true')
  }

  return (
    <>
      {/* Loading Screen - shown on initial load */}
      {isLoading && (
        <LoadingScreen 
          onReadyToAnimate={handleReadyToAnimate}
          onComplete={handleLoadingComplete} 
        />
      )}
      
      {/* Welcome Modal - shown once after intro animation */}
      <WelcomeModal 
        isOpen={showWelcome} 
        onStart={handleCloseWelcome} 
      />

      <Canvas
        shadows
        camera={{ position: [0, 200, 500], fov: 45, near: 0.1, far: 10000 }}
      >
        <color attach="background" args={['#050a0f']} />
        <Suspense fallback={null}>
          <Experience startAnimation={canStartAnimation} onIntroComplete={handleIntroComplete} />
        </Suspense>
      </Canvas>
      <Loader />
      
      {/* HUD - Desktop vs Mobile */}
      {isMobile ? <CockpitHUDMobile /> : <CockpitHUD />}
      
      <SpaceshipControls />
      <WindowManager />
      
      {/* Mobile touch controls - only in spaceship mode */}
      {isMobile && isSpaceshipMode && <MobileControls />}
      
      {/* Death screen overlay */}
      <DeathScreen />
      
      {/* Desktop only components - hidden in spaceship mode */}
      {!isMobile && !isSpaceshipMode && <Taskbar />}
      {!isMobile && <DebugPanel />}
    </>
  )
}

export default ExperiencePage
