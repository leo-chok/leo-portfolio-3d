import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useInView } from '../../hooks/useInView'
import { ResumeSection } from './ResumeSection'
import { contact } from '../../data/contact'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faLocationDot, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import './ResumeContact.css'

/**
 * ResumeContact - Contact section with social links and form
 * 
 * Features:
 * - Social links with icons
 * - Contact form (Formspree)
 * - Uses Intersection Observer for reliable mobile detection
 */
export const ResumeContact = () => {
    const contactRef = useRef(null)
    const [observerRef, isInView] = useInView({ threshold: 0.1 })
    const hasAnimated = useRef(false)
    const [formStatus, setFormStatus] = useState('idle') // idle, sending, success, error
    
    useEffect(() => {
        const items = contactRef.current?.querySelectorAll('.contact__card, .contact__form-wrapper')
        if (!items?.length) return
        
        if (isInView && !hasAnimated.current) {
            hasAnimated.current = true
            gsap.to(items, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.15,
                ease: 'power2.out'
            })
        }
    }, [isInView])
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormStatus('sending')
        
        const form = e.target
        const data = new FormData(form)
        
        try {
            const response = await fetch(contact.formEndpoint, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            })
            
            if (response.ok) {
                setFormStatus('success')
                form.reset()
            } else {
                setFormStatus('error')
            }
        } catch {
            setFormStatus('error')
        }
    }
    
    return (
        <ResumeSection id="contact" title="Contact" icon="◈">
            <div 
                className="contact" 
                ref={(el) => { contactRef.current = el; observerRef.current = el }}
            >
                {/* Info card */}
                <div 
                    className="contact__card"
                    style={{ opacity: 0, transform: 'translateY(40px)' }}
                >
                    <p className="contact__cta">{contact.cta}</p>
                    
                    <div className="contact__info">
                        <div className="contact__info-item">
                            <FontAwesomeIcon icon={faLocationDot} className="contact__info-icon" />
                            <span>{contact.location.city}, {contact.location.country}</span>
                        </div>
                        <div className="contact__info-item">
                            <FontAwesomeIcon icon={faEnvelope} className="contact__info-icon" />
                            <a href={`mailto:${contact.email}`}>{contact.email}</a>
                        </div>
                    </div>
                    
                    <div className="contact__social">
                        <a 
                            href={contact.social.linkedin.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact__social-link"
                        >
                            <FontAwesomeIcon icon={faLinkedin} />
                            <span>{contact.social.linkedin.label}</span>
                        </a>
                        <a 
                            href={contact.social.github.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contact__social-link"
                        >
                            <FontAwesomeIcon icon={faGithub} />
                            <span>{contact.social.github.label}</span>
                        </a>
                    </div>
                </div>
                
                {/* Contact form */}
                <div 
                    className="contact__form-wrapper"
                    style={{ opacity: 0, transform: 'translateY(40px)' }}
                >
                    <form className="contact__form" onSubmit={handleSubmit}>
                        <div className="contact__form-group">
                            <label htmlFor="name" className="contact__label">Nom</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                required 
                                className="contact__input"
                                placeholder="Votre nom"
                            />
                        </div>
                        <div className="contact__form-group">
                            <label htmlFor="email" className="contact__label">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                required 
                                className="contact__input"
                                placeholder="votre@email.com"
                            />
                        </div>
                        <div className="contact__form-group">
                            <label htmlFor="message" className="contact__label">Message</label>
                            <textarea 
                                id="message" 
                                name="message" 
                                required 
                                rows="4"
                                className="contact__input contact__textarea"
                                placeholder="Votre message..."
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="contact__submit"
                            disabled={formStatus === 'sending'}
                        >
                            <FontAwesomeIcon icon={faPaperPlane} />
                            <span>
                                {formStatus === 'sending' ? 'Envoi...' : 
                                 formStatus === 'success' ? 'Envoyé !' : 
                                 'Envoyer'}
                            </span>
                        </button>
                        
                        {formStatus === 'error' && (
                            <p className="contact__error">Une erreur est survenue. Réessayez.</p>
                        )}
                    </form>
                </div>
            </div>
        </ResumeSection>
    )
}
