import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Loader } from '@react-three/drei'
import { Experience } from './components/core/Experience'
import { NavigationPanel } from './components/hud/NavigationPanel'
import { CockpitHUD } from './components/hud/CockpitHUD'
import { DebugPanel } from './components/hud/DebugPanel'
import { ContentManager } from './components/hud/ContentManager'

function App() {
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 10, 40], fov: 45 }}
      >
        <color attach="background" args={['#050a0f']} />
        <Suspense fallback={null}>
          <Experience />
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
