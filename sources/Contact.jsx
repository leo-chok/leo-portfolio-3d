// src/components/Contact.jsx
import React from 'react';
import { useInView } from 'react-intersection-observer';

const FORM_ENDPOINT = "https://formspree.io/f/manedeyw";

function Contact() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });


  const showPhoneNumber = false; 
  const linkedInUrl = "https://www.linkedin.com/in/leo-stalhberger/"; 
  const githubUrl = "https://github.com/leo-chok"; 

  return (
    <section
      ref={ref}
      className={`nes-container is-dark with-title fade-in-section ${inView ? 'is-visible' : ''}`}
      style={{ marginBottom: '2rem' }}
    >
      <h2 className="title">Contact</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>

        {/* --- Colonne Infos & Liens --- */}
        <div style={{ flex: '1 1 300px' }}>
          <p>Prêt à discuter de projets innovants ou d'une opportunité d'alternance ? Contactez-moi !</p>

          {/* Email */}
          <p style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <i className="nes-icon envelope is-small" style={{ marginRight: '0.5rem' }}></i>
            <a href="mailto:stalh.leo@gmail.com">stalh.leo@gmail.com</a>
          </p>

          

          {/* Localisation */}
           <p style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
             <i className="nes-icon location is-small" style={{ marginRight: '0.5rem' }}></i>
             Région Lilloise, France
           </p>

          {/* Liens Sociaux */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent : 'center' }}>
            <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" className="nes-btn">
              <i className="nes-icon linkedin is-small" style={{ marginRight: '0.5rem' }}></i>
              LinkedIn
            </a>
            <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="nes-btn">
              <i className="nes-icon github is-small" style={{ marginRight: '0.5rem' }}></i>
              GitHub
            </a>
          </div>
        </div>

        {/* --- Colonne Formulaire --- */}
        <div style={{ flex: '1 1 350px' }}>
          <form action={FORM_ENDPOINT} method="POST">
            <div className="nes-field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="name_field">Votre Nom</label>
              <input type="text" id="name_field" name="name" className="nes-input is-dark" required placeholder="Mario..." />
            </div>

            <div className="nes-field" style={{ marginBottom: '1rem' }}>
              <label htmlFor="email_field">Votre Email</label>
              <input type="email" id="email_field" name="email" className="nes-input is-dark" required placeholder="mario@domain.com..." />
            </div>

            <div className="nes-field" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="message_field">Message</label>
              <textarea id="message_field" name="message" className="nes-textarea is-dark" rows="5" required placeholder="It's a me..."></textarea>
            </div>

            <button type="submit" className="nes-btn is-primary">
              Envoyer
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}

export default Contact;