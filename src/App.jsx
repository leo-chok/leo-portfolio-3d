import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import { Loader } from '@react-three/drei'
import { Experience } from './components/core/Experience'
import { NavigationPanel } from './components/hud/NavigationPanel'
import { CockpitHUD } from './components/hud/CockpitHUD'
import { DebugPanel } from './components/hud/DebugPanel'
import { ContentManager } from './components/hud/ContentManager'
import { LoadingScreen } from './components/hud/LoadingScreen'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [canStartAnimation, setCanStartAnimation] = useState(false)

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
        camera={{ position: [0, 80, 250], fov: 45 }}
      >
        <color attach="background" args={['#050a0f']} />
        <Suspense fallback={null}>
          <Experience startAnimation={canStartAnimation} />
        </Suspense>
      </Canvas>
      <Loader />
      <CockpitHUD />
      <NavigationPanel />
      <ContentManager />
      <DebugPanel />
    </>
  )
}

export default App
