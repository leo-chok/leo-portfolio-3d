// src/components/Experience.jsx
import React from 'react';

import { useInView } from 'react-intersection-observer';

function Experience() {

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const StarIcon = () => (
    <i className="nes-icon star is-small is-warning" style={{ marginRight: '0.5rem' }}></i>
  );

  return (
    
    <section
      ref={ref}
      className={`nes-container is-rounded is-dark with-title fade-in-section ${inView ? 'is-visible' : ''}`}
      style={{ marginBottom: '2rem' }}
    >
      {/* Titre de la section */}
      <h1 className="title">Expériences & Formations</h1>

      {/* --- Formation --- */}
      <div style={{ marginBottom: '1.5rem' }}> {/* Bloc pour la formation */}
        <p><strong className="nes-text is-success">Formation Développeur Full-Stack</strong></p>
        <p> <span className="nes-text is-primary">La Capsule (Lille)</span> - Bootcamp Intensif (3 mois)</p>
        <div className="lists">
          <ul className="nes-list is-disc">
            <li><StarIcon />Stack principale : React, React Native, Node.js, Express, MongoDB</li>
            <li><StarIcon />Méthodologies Agile (Scrum) & Pratiques Clean Code</li>
            <li><StarIcon />Gestion de projet avec Git/GitHub</li>
            <li><StarIcon />Développement d'une application Full-Stack en équipe (projet final)</li>
            <li><StarIcon />Introduction aux concepts DevOps</li>
          </ul>
        </div>
      </div>

      {/* --- Expériences Professionnelles (ordre anti-chronologique) --- */}

      {/* Freelance */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p><strong className="nes-text is-success">Dessinateur / Infographiste 3D</strong></p>
        <p> <span className="nes-text is-primary">Freelance (LEO 3D Design)</span> | Jan 2023 - Maintenant</p>
        <div className="lists">
          <ul className="nes-list is-disc">
            <li><StarIcon />Conception de plans et rendus 3D</li>
            <li><StarIcon />Modélisation pour communication visuelle</li>
          </ul>
        </div>
      </div>

      {/* AUDD */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p><strong className="nes-text is-success">Dessinateur en Architecture</strong></p>
        <p> <span className="nes-text is-primary">AUDD (CDI)</span> | Août 2016 - Déc 2022</p>
        <div className="lists">
          <ul className="nes-list is-disc">
            <li><StarIcon />Création de plans architecturaux 2D/3D</li>
            <li><StarIcon />Rendus photoréalistes (<span className="nes-text is-warning">D5Render</span>, <span className="nes-text is-warning">Unreal Engine</span>)</li>
          </ul>
        </div>
      </div>

      {/* ESCATECH */}
      <div style={{ marginBottom: '1.5rem' }}>
        {/* Le titre du poste était "Concepteur produits industriels", mais les tâches listées sont orientées archi */}
        <p><strong className="nes-text is-success">Conception 2D/3D & Suivi de Projet</strong></p>
        <p> <span className="nes-text is-primary">ESCATECH (CDI)</span> | Août 2012 - Juin 2016</p>
        <div className="lists">
          <ul className="nes-list is-disc">
            <li><StarIcon />Conception de plans d'architecture 2D/3D (<span className="nes-text is-warning">AutoCAD</span>, <span className="nes-text is-warning">Revit</span>)</li>
            <li><StarIcon />Études de faisabilité & Suivi de chantier</li>
            <li><StarIcon />Collecte de données sur site & Documents administratifs</li>
          </ul>
        </div>
      </div>

    </section>
  );
}

export default Experience;