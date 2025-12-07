import { projects } from '../../../data/projects'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons' // Need to check if installed, usually is
import { faExternalLinkAlt, faPlay } from '@fortawesome/free-solid-svg-icons'
import './PortfolioView.css'

export const PortfolioView = ({ onProjectSelect }) => {
    return (
        <div className="portfolio-view">
            <div className="portfolio-grid">
                {projects.map((project) => (
                    <div 
                        key={project.id} 
                        className="project-card"
                        onClick={() => onProjectSelect?.(project)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="project-card__image-container">
                            <img src={project.image} alt={project.title} className="project-card__image" />
                            <div className="project-card__links-overlay">
                                <a href={project.demo} target="_blank" rel="noopener noreferrer" className="project-link-btn primary" title="Live Demo">
                                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                                </a>
                                <a href={project.github} target="_blank" rel="noopener noreferrer" className="project-link-btn" title="View Code">
                                    <FontAwesomeIcon icon={faGithub} />
                                </a>
                                {project.video && (
                                     <a href={project.video} target="_blank" rel="noopener noreferrer" className="project-link-btn" title="Watch Video">
                                        <FontAwesomeIcon icon={faPlay} />
                                    </a>
                                )}
                            </div>
                        </div>
                        
                        <div className="project-card__content">
                            <div className="project-header">
                                <h3 className="project-title">{project.title}</h3>
                            </div>
                            
                            <p className="project-description">{project.description}</p>
                            
                            <div className="project-stack">
                                {project.stack.map((tech) => (
                                    <span key={tech} className="tech-tag">{tech}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
