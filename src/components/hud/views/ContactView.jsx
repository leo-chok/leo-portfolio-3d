import { contact } from '../../../data/contact'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLocationDot, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons'
import './ContactView.css'

/**
 * ContactView - Contact information and form
 * Uses data from contact.js for clean architecture
 */
export const ContactView = () => {
    const { email, location, social, formEndpoint, cta } = contact
    
    return (
        <div className="view-contact">
            {/* Info Section */}
            <div className="view-contact__info">
                <p className="view-contact__cta">{cta}</p>
                
                {/* Contact Details */}
                <div className="view-contact__details">
                    <a href={`mailto:${email}`} className="view-contact__item">
                        <FontAwesomeIcon icon={faEnvelope} className="view-contact__icon" />
                        <span>{email}</span>
                    </a>
                    
                    <div className="view-contact__item">
                        <FontAwesomeIcon icon={faLocationDot} className="view-contact__icon" />
                        <span>{location.city}, {location.country}</span>
                    </div>
                </div>
                
                {/* Social Links */}
                <div className="view-contact__social">
                    <a 
                        href={social.linkedin.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="view-contact__social-btn"
                    >
                        <FontAwesomeIcon icon={faLinkedin} />
                        <span>{social.linkedin.label}</span>
                    </a>
                    <a 
                        href={social.github.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="view-contact__social-btn"
                    >
                        <FontAwesomeIcon icon={faGithub} />
                        <span>{social.github.label}</span>
                    </a>
                </div>
            </div>
            
            {/* Form Section */}
            <div className="view-contact__form-container">
                <h4 className="view-contact__form-title">SEND MESSAGE</h4>
                
                <form action={formEndpoint} method="POST" className="view-contact__form">
                    <div className="view-contact__field">
                        <label htmlFor="contact-name">NOM</label>
                        <input 
                            type="text" 
                            id="contact-name" 
                            name="name" 
                            required 
                            placeholder="Votre nom..."
                        />
                    </div>
                    
                    <div className="view-contact__field">
                        <label htmlFor="contact-email">EMAIL</label>
                        <input 
                            type="email" 
                            id="contact-email" 
                            name="email" 
                            required 
                            placeholder="votre@email.com"
                        />
                    </div>
                    
                    <div className="view-contact__field">
                        <label htmlFor="contact-message">MESSAGE</label>
                        <textarea 
                            id="contact-message" 
                            name="message" 
                            rows="4" 
                            required 
                            placeholder="Votre message..."
                        />
                    </div>
                    
                    <button type="submit" className="view-contact__submit">
                        <FontAwesomeIcon icon={faPaperPlane} />
                        <span>ENVOYER</span>
                    </button>
                </form>
            </div>
        </div>
    )
}
