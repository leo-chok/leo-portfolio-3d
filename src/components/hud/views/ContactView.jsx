import { useState } from 'react'
import { contact } from '../../../data/contact'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faLocationDot, faPaperPlane, faSignal } from '@fortawesome/free-solid-svg-icons'
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons'
import './ContactView.css'

/**
 * ContactView - Contact information and form
 * Sci-Fi communication terminal design
 */
export const ContactView = () => {
    const { email, location, social, formEndpoint, cta } = contact
    const [sending, setSending] = useState(false)
    
    const handleSubmit = (e) => {
        e.preventDefault()
        setSending(true)
        // Simulate sending delay then submit
        setTimeout(() => {
            e.target.submit()
        }, 1000)
    }
    
    return (
        <div className="view-contact">
            {/* Info Section */}
            <div className="view-contact__info">
                <div className="view-contact__status">
                    <FontAwesomeIcon icon={faSignal} className="view-contact__status-icon" />
                    <span>CHANNEL OPEN</span>
                </div>
                
                <p className="view-contact__cta">{cta}</p>
                
                {/* Contact Details */}
                <div className="view-contact__details">
                    <a href={`mailto:${email}`} className="view-contact__item">
                        <span className="view-contact__item-bracket">[</span>
                        <FontAwesomeIcon icon={faEnvelope} className="view-contact__icon" />
                        <span>{email}</span>
                        <span className="view-contact__item-bracket">]</span>
                    </a>
                    
                    <div className="view-contact__item">
                        <span className="view-contact__item-bracket">[</span>
                        <FontAwesomeIcon icon={faLocationDot} className="view-contact__icon" />
                        <span>{location.city}, {location.country}</span>
                        <span className="view-contact__item-bracket">]</span>
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
                <div className="view-contact__form-header">
                    <span className="view-contact__form-title">// TRANSMIT MESSAGE</span>
                    <span className="view-contact__form-status">READY</span>
                </div>
                
                <form action={formEndpoint} method="POST" className="view-contact__form" onSubmit={handleSubmit}>
                    <div className="view-contact__field">
                        <label htmlFor="contact-name">IDENTIFIER</label>
                        <input 
                            type="text" 
                            id="contact-name" 
                            name="name" 
                            required 
                            placeholder="Votre nom..."
                            autoComplete="name"
                        />
                    </div>
                    
                    <div className="view-contact__field">
                        <label htmlFor="contact-email">FREQUENCY</label>
                        <input 
                            type="email" 
                            id="contact-email" 
                            name="email" 
                            required 
                            placeholder="votre@email.com"
                            autoComplete="email"
                        />
                    </div>
                    
                    <div className="view-contact__field">
                        <label htmlFor="contact-message">PAYLOAD</label>
                        <textarea 
                            id="contact-message" 
                            name="message" 
                            rows="4" 
                            required 
                            placeholder="Votre message..."
                        />
                    </div>
                    
                    <button type="submit" className={`view-contact__submit ${sending ? 'sending' : ''}`} disabled={sending}>
                        <span className="view-contact__submit-icon">
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </span>
                        <span>{sending ? 'TRANSMITTING...' : 'TRANSMIT'}</span>
                    </button>
                </form>
            </div>
        </div>
    )
}
