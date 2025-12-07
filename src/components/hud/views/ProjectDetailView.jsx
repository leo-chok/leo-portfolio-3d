import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faExternalLinkAlt, faPlay, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import './ProjectDetailView.css'

export const ProjectDetailView = ({ project, onBack }) => {
    if (!project) return null

    return (
        <div className="project-detail-view">
            <button className="back-btn" onClick={onBack}>
                <FontAwesomeIcon icon={faArrowLeft} /> Back to List
            </button>
            
            <div className="detail-header">
                <h2 className="detail-title">{project.title}</h2>
                <div className="detail-links">
                    <a href={project.demo} target="_blank" rel="noopener noreferrer" className="detail-link primary">
                        <FontAwesomeIcon icon={faExternalLinkAlt} /> Live Demo
                    </a>
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="detail-link">
                        <FontAwesomeIcon icon={faGithub} /> Code
                    </a>
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
                </div>
                
                <div className="detail-info">
                    <h3>About the Project</h3>
                    <p className="detail-description">{project.description}</p>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    
                    <h3>Technologies</h3>
                    <div className="detail-stack">
                        {project.stack.map((tech) => (
                            <span key={tech} className="detail-tech-tag">{tech}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
