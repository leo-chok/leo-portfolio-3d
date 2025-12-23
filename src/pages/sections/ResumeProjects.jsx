import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ResumeSection } from './ResumeSection'
import { projects } from '../../data/projects'
import './ResumeProjects.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * ResumeProjects - Projects grid with expandable cards
 * 
 * Features:
 * - Grid of project cards with images
 * - Click to expand with full details
 * - Smooth expand/collapse animation
 */
export const ResumeProjects = () => {
    const [expandedId, setExpandedId] = useState(null)
    const gridRef = useRef(null)
    
    useEffect(() => {
        const cards = gridRef.current?.querySelectorAll('.projects__card')
        if (!cards?.length) return
        
        gsap.set(cards, { opacity: 0, y: 50 })
        
        const trigger = ScrollTrigger.create({
            trigger: gridRef.current,
            start: 'top 85%',
            once: true, // Play only once, more reliable on mobile
            onEnter: () => {
                gsap.to(cards, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'power2.out'
                })
            }
        })
        
        return () => {
            trigger.kill()
        }
    }, [])
    
    const handleCardClick = (projectId) => {
        setExpandedId(expandedId === projectId ? null : projectId)
    }
    
    return (
        <ResumeSection id="projects" title="Projets" icon="◈">
            <div className="projects" ref={gridRef}>
                <div className="projects__grid">
                    {projects.map((project) => (
                        <article 
                            key={project.id}
                            className={`projects__card ${expandedId === project.id ? 'projects__card--expanded' : ''}`}
                            onClick={() => handleCardClick(project.id)}
                        >
                            {/* Preview */}
                            <div className="projects__preview">
                                <div className="projects__image-wrapper">
                                    <img 
                                        src={project.image} 
                                        alt={project.title}
                                        className="projects__image"
                                        loading="lazy"
                                    />
                                    <div className="projects__image-overlay" />
                                </div>
                                
                                <div className="projects__info">
                                    <h3 className="projects__title">{project.title}</h3>
                                    <p className="projects__subtitle">{project.subtitle}</p>
                                    <p className="projects__short-desc">{project.short_description}</p>
                                    <span className="projects__expand-hint">
                                        {expandedId === project.id ? '▲ Réduire' : '▼ Voir plus'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Expanded content */}
                            <div className="projects__details">
                                <p className="projects__full-desc">{project.description}</p>
                                
                                <div className="projects__stack">
                                    <span className="projects__stack-label">Stack :</span>
                                    <div className="projects__stack-items">
                                        {project.stack.map((tech, idx) => (
                                            <span key={idx} className="projects__stack-item">{tech}</span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="projects__links">
                                    {project.github && (
                                        <a 
                                            href={project.github} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="projects__link projects__link--github"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <span className="projects__link-icon">⌂</span>
                                            GitHub
                                        </a>
                                    )}
                                    {project.demo && (
                                        <a 
                                            href={project.demo} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="projects__link projects__link--demo"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <span className="projects__link-icon">▶</span>
                                            {project.video ? 'Vidéo' : 'Demo'}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </ResumeSection>
    )
}
