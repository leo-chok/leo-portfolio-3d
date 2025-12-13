// src/components/Hero.jsx
import React, { useState, useEffect, useRef } from "react";
import monAvatar from "../assets/avatar.png";
import throttle from "lodash.throttle"; // Importe throttle
import { Link } from "react-scroll";
import "./Hero.css";

function Hero() {
  // Propriétés communes pour les Links react-scroll
  const scrollProps = {
    smooth: true,
    duration: 500,
    spy: true,
    offset: -80, 
    activeClass: "active", 
  };

  const avatarRef = useRef(null); // Ref pour l'image avatar
  const eyeRef = useRef(null); // Ref pour l'élément oeil

  // État pour stocker le style de transform de l'oeil
  const [eyeStyle, setEyeStyle] = useState({
    transform: "translate(0px, 0px)",
  });

  // --- Logique pour suivre la souris (dans useEffect) ---
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!avatarRef.current || !eyeRef.current) return;

      // Position de l'avatar 
      const avatarRect = avatarRef.current.getBoundingClientRect();
    
      const eyeOriginX = avatarRect.left + avatarRect.width * .5;
      const eyeOriginY = avatarRect.top + avatarRect.height * .2; 

      // Position de la souris
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // Calcul simple de la direction (delta X, delta Y)
      const deltaX = mouseX - eyeOriginX;
      const deltaY = mouseY - eyeOriginY;

      // Limiter le déplacement de l'oeil 
      const maxMove = 5;
      const angle = Math.atan2(deltaY, deltaX); // Angle vers la souris
      // Calcule le déplacement mais limite sa magnitude
      const moveX = Math.min(
        maxMove,
        Math.max(-maxMove, Math.cos(angle) * maxMove * 0.5 + deltaX * 0.02)
      ); // Combinaison pour un effet subtil
      const moveY = Math.min(
        maxMove,
        Math.max(-maxMove, Math.sin(angle) * maxMove * 0.1 + deltaY * 0.02)
      );

      // Met à jour le style de l'oeil
      setEyeStyle({
        transform: `translate(${moveX.toFixed(1)}px, ${moveY.toFixed(1)}px)`,
      });
    };

    // Applique le throttle pour ne pas surcharger
    const throttledMouseMove = throttle(handleMouseMove, 100); 

    window.addEventListener("mousemove", throttledMouseMove);

    // Nettoyage de l'écouteur
    return () => {
      window.removeEventListener("mousemove", throttledMouseMove);
      throttledMouseMove.cancel(); // Annule tout appel throttled en attente
    };
  }, []); 
  return (
    <section
      className="nes-container is-dark is-rounded is-centered"
      style={{ marginBottom: "1rem", marginTop: "5rem" }}
    >
      {/* Mettons le nom en couleur primaire */}
      <h1
        style={{
          marginBottom: "0",
          color: "#209cee" ,
        }}
      >
        Léo Stalhberger
      </h1>
      <div
        style={{
          position: "relative",
          display: "inline-block",
          marginBottom: "1.5rem",
        }}
      >
        <img
          ref={avatarRef}
          src={monAvatar} 
          alt="Mon Avatar Pixel Art" 
          style={{
            width: "225px", 
            height: "350px",
            margin: "0", 
          }}
        />
        <div
          ref={eyeRef} 
          className="avatar-eye-left" 
          style={{
             ...eyeStyle
          }}
        ></div>
        <div
          ref={eyeRef} 
          className="avatar-eye-right" 
          style={{
             ...eyeStyle
          }}
        ></div>
      </div>

      <p style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
        {/* Mettons en évidence le rôle */}
        Développeur <span className="nes-text is-primary">Full-Stack</span> Web
        et Applications
      </p>

      <p style={{ marginBottom: "1rem" }}>
        Passionné de code et d'expériences intéractives (Jeux Vidéo) <br></br>
        En recherche d'
        <span className="nes-text is-warning">alternance sur 2 ans </span>
        en Master avec 

        <span className="nes-text is-success"> Epitech</span>      </p>

      <div
        style={{
          display: "flex",
          width: "100%",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        
        <Link
          className="nes-btn is-primary nav-link"
          to="projects"
          {...scrollProps}
          style={{ marginRight: "1rem" }}
        >
          Mes Projets
        </Link>
        <Link to="contact" className="nes-btn is-success" {...scrollProps}>
          Contactez-moi
        </Link>
      </div>
    </section>
  );
}

export default Hero;
