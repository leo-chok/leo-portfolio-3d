import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { WelcomePage } from './pages/WelcomePage'
import { ResumePage } from './pages/ResumePage'
import { useAudioStore } from './stores/audioStore'

// Lazy load the 3D experience to avoid loading Three.js bundle on other pages
const ExperiencePage = lazy(() => import('./pages/ExperiencePage'))

/**
 * GlobalAudioListeners - Wrapper that adds global click/hover sounds
 */
const GlobalAudioListeners = ({ children }) => {
    // Global hover sound for buttons
    useEffect(() => {
        const handleHover = (e) => {
            // Safety check: e.target might not be an Element
            if (!e.target?.matches) return
            
            const audioStore = useAudioStore.getState()
            if (!audioStore.isInitialized) return
            
            // Resume cards - use hover2 sound
            if (e.target.matches('.skills__card, .projects__card, .formations__card, .contact__card') ||
                e.target.closest?.('.skills__card, .projects__card, .formations__card, .contact__card')) {
                audioStore.playHover2()
                return
            }
            
            // Buttons and links - use hover sound
            if (e.target.matches('button, a, .welcome__cta')) {
                audioStore.playHover()
            }
        }
        
        document.addEventListener('mouseenter', handleHover, true)
        return () => document.removeEventListener('mouseenter', handleHover, true)
    }, [])
    
    // Global click sound for buttons and links
    useEffect(() => {
        const handleClick = (e) => {
            // Safety check: e.target might not be an Element
            if (!e.target?.matches) return
            
            if (e.target.matches('button, a, [role="button"]') || e.target.closest?.('button, a, [role="button"]')) {
                const audioStore = useAudioStore.getState()
                if (audioStore.isInitialized) {
                    audioStore.playClick()
                }
            }
        }
        
        document.addEventListener('click', handleClick, true)
        return () => document.removeEventListener('click', handleClick, true)
    }, [])
    
    return children
}

/**
 * Router - Main application router
 * 
 * Routes:
 * - / : Welcome page with choice between Resume and 3D Experience
 * - /resume : Scrollable CV page
 * - /experience : Full 3D interactive experience (lazy loaded)
 */
export const Router = () => {
    return (
        <BrowserRouter>
            <GlobalAudioListeners>
                <Routes>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/resume" element={<ResumePage />} />
                    <Route 
                        path="/experience" 
                        element={
                            <Suspense fallback={null}>
                                <ExperiencePage />
                            </Suspense>
                        } 
                    />
                </Routes>
            </GlobalAudioListeners>
        </BrowserRouter>
    )
}
