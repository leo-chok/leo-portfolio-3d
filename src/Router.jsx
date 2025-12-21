import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { WelcomePage } from './pages/WelcomePage'
import { ResumePage } from './pages/ResumePage'

// Lazy load the 3D experience to avoid loading Three.js bundle on other pages
const ExperiencePage = lazy(() => import('./pages/ExperiencePage'))

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
        </BrowserRouter>
    )
}
