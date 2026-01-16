import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useEffect } from 'react'
import { Loader } from '@react-three/drei'
import { Experience } from './components/core/Experience'
import { CockpitHUD } from './components/hud/CockpitHUD'
import { SpaceshipControls, WaveAnnouncement } from './game'
import { DebugPanel } from './components/hud/DebugPanel'
import { WindowManager } from './components/hud/WindowManager'
import { Taskbar } from './components/hud/common/Taskbar'
import { LoadingScreen } from './components/hud/LoadingScreen'
import { ZenModeButton } from './components/hud/ZenModeButton'
import { ZenModeOverlay } from './components/hud/ZenModeOverlay'
import { useSpaceshipStore } from './stores/spaceshipStore'
import { useZenModeStore } from './stores/zenModeStore'
import { useAudioStore } from './stores/audioStore'

console.log('[App] WaveAnnouncement imported:', WaveAnnouncement)

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [canStartAnimation, setCanStartAnimation] = useState(false)
  const isSpaceshipMode = useSpaceshipStore(state => state.isSpaceshipMode)
  const enterSpaceshipMode = useSpaceshipStore(state => state.enterSpaceshipMode)
  const exitSpaceshipMode = useSpaceshipStore(state => state.exitSpaceshipMode)
  const isZenMode = useZenModeStore(state => state.isZenMode)
  
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
  
  // Note: Global hover/click sounds are now handled in Router.jsx GlobalAudioListeners

  // Called when loading reaches 100% (before fade out)
  const handleReadyToAnimate = () => {
    setCanStartAnimation(true)
  }

  // Called after fade out is complete
  const handleLoadingComplete = () => {
    setIsLoading(false)
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

      <Canvas
        shadows
        camera={{ position: [0, 200, 500], fov: 45, near: 0.1, far: 10000 }}
      >
        <color attach="background" args={['#050a0f']} />
        <Suspense fallback={null}>
          <Experience startAnimation={canStartAnimation} />
        </Suspense>
      </Canvas>
      <Loader />
      
      {/* HUD components - hidden in zen mode */}
      {!isZenMode && (
        <>
          <CockpitHUD />
          <SpaceshipControls />
          <WaveAnnouncement />
          <WindowManager />
          <Taskbar />
          <DebugPanel />
        </>
      )}
      
      {/* Zen Mode UI */}
      {console.log('[App] ZenModeButton conditions:', { isLoading, isSpaceshipMode })}
      {!isLoading && !isSpaceshipMode && <ZenModeButton />}
      <ZenModeOverlay />
    </>
  )
}

export default App
