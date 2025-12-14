import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useEffect } from 'react'
import { Loader } from '@react-three/drei'
import { Experience } from './components/core/Experience'
import { CockpitHUD } from './components/hud/CockpitHUD'
import { SpaceshipHUD } from './components/hud/SpaceshipHUD'
import { DebugPanel } from './components/hud/DebugPanel'
import { WindowManager } from './components/hud/WindowManager'
import { LoadingScreen } from './components/hud/LoadingScreen'
import { useSpaceshipStore } from './stores/spaceshipStore'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [canStartAnimation, setCanStartAnimation] = useState(false)
  const isSpaceshipMode = useSpaceshipStore(state => state.isSpaceshipMode)
  const enterSpaceshipMode = useSpaceshipStore(state => state.enterSpaceshipMode)
  const exitSpaceshipMode = useSpaceshipStore(state => state.exitSpaceshipMode)
  
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
        camera={{ position: [0, 200, 500], fov: 45 }}
      >
        <color attach="background" args={['#050a0f']} />
        <Suspense fallback={null}>
          <Experience startAnimation={canStartAnimation} />
        </Suspense>
      </Canvas>
      <Loader />
      <CockpitHUD />
      {isSpaceshipMode && <SpaceshipHUD />}
      <WindowManager />
      <DebugPanel />
    </>
  )
}

export default App
