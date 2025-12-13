// src/components/Footer.jsx
import React from "react";

import { Link } from "react-scroll";
import { ArrowUp } from "@nsmr/pixelart-react";


function Footer() {
  // Obtenir l'année actuelle dynamiquement
  const currentYear = new Date().getFullYear();

  // Styles pour le footer
  const footerStyle = {
    textAlign: "center",
    padding: "1.5rem 1rem",
    marginTop: "3rem", // Espace au-dessus du footer
    backgroundColor: "#212529", // Gris foncé NES.css (ou #000)
    color: "#ffffff", // Texte blanc
    borderTop: "4px solid #fff", // Simple ligne blanche en haut
    fontSize: "0.9rem", // Texte légèrement plus petit
  };

  // Style pour les liens (Retour en haut, icônes sociales)
  const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    margin: "0 0.75rem", // Espace autour des icônes/liens
  };



  const linkedInUrl = "https://www.linkedin.com/in/leo-stalhberger/";
  const githubUrl = "https://github.com/leo-chok";

  return (
    <footer style={footerStyle}>
      {/* Optionnel: Lien "Retour en haut" */}
      <div style={{ marginBottom: "1rem" }}>
        <Link
          to="accueil" 
          smooth={true}
          duration={500}
          offset={-80} 
          style={linkStyle}
          title="Retour en haut" 
        >
          
          <ArrowUp size={36} style={{ margin: '0.5rem'}} />
          Retour en haut
          <ArrowUp size={36} style={{ margin: '0.5rem'}} />
          
        </Link>
      </div>

      {/* Copyright */}
      <p style={{ marginBottom: "1rem" }}>
        © {currentYear} Léo Stalhberger. Tous droits réservés.
      </p>

      {/* Optionnel: Icônes Liens Sociaux */}
      <div>
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
          title="LinkedIn"
        >
          <i className="nes-icon linkedin is-medium"></i>{" "}
          {/* Icône un peu plus grande */}
        </a>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
          title="GitHub"
        >
          <i className="nes-icon github is-medium"></i>{" "}
          {/* Icône un peu plus grande */}
        </a>
        
      </div>
    </footer>
  );
}

export default Footer;
