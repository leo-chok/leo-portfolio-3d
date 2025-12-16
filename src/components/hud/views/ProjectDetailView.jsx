import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faExternalLinkAlt, faPlay, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import './ProjectDetailView.css'

export const ProjectDetailView = ({ project, onBack }) => {
    if (!project) return null

    return (
        <div className="project-detail-view">
            
            <div className="detail-header">
                <div className="detail-header__text">
                    <h2 className="detail-title">{project.title}</h2>
                    {project.subtitle && (
                        <span className="detail-subtitle">{project.subtitle}</span>
                    )}
                </div>
                <div className="detail-links">
                    {project.demo && (
                        <a href={project.demo} target="_blank" rel="noopener noreferrer" className="detail-link primary">
                            <FontAwesomeIcon icon={faExternalLinkAlt} /> Demo
                        </a>
                    )}
                    {project.github && (
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="detail-link">
                            <FontAwesomeIcon icon={faGithub} /> Code
                        </a>
                    )}
                    {project.video && (
                         <a href={project.video} target="_blank" rel="noopener noreferrer" className="detail-link">
                            <FontAwesomeIcon icon={faPlay} /> Video
                        </a>
                    )}
                </div>
            </div>

            <div className="detail-content">
                <div className="detail-image-container">
                    <img src={project.image} alt={project.title} className="detail-image" />
                    <div className="detail-image__overlay">
                        <span className="detail-image__label">PROJECT SCAN</span>
                    </div>
                </div>
                
                <div className="detail-info">
                    <h3>// DESCRIPTION</h3>
                    <p className="detail-description">{project.description}</p>
                    
                    <h3>// TECHNOLOGIES</h3>
                    <div className="detail-stack">
                        {project.stack.map((tech, index) => (
                            <span 
                                key={tech} 
                                className="detail-tech-tag"
                                style={{ '--delay': `${index * 0.1}s` }}
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
