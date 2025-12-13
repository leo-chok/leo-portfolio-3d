// src/components/Skills.jsx
import React from "react";
import { useInView } from "react-intersection-observer";
import Marquee from "react-fast-marquee"; // Assure-toi qu'il est importé

// Liste des compétences (ta version avec textes courts)
const skillsData = {
  'Front-End': [ "HTML5", "CSS3", "JavaScript", "TypeScript", "React.js", "React Native", "Tailwind", "Components", "Next.js", "Redux" ],
  'Back-End & Base de Données': [ "Node.js", "Express.js", "MongoDB", "Mongoose", "API REST" ],
  'Outils & DevOps': ["Git", "GitHub", "CI/CD", "Docker"],
  'Méthodologies & Gestion': [ "Agile", "Scrum", "Trello", "Notion", "Clean Code" ],
  'Outils Design & 3D': [ "AutoCAD", "Revit", "Unreal Engine", "D5Render", "Blender" ],
  'Soft Skills': [ "Teamwork", "Communication", "Adaptabilité", "Apprentissage", "Logique", "Curieux" ],
};

// Couleurs pour les badges (ta version)
const badgeColors = ["is-primary", "is-success", "is-warning", "is-error"];

function Skills() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1, // Peut-être déclencher un peu plus tôt si la section est haute
  });

  return (
    <section
      ref={ref}
      className={`nes-container is-rounded is-dark with-title fade-in-section ${ inView ? "is-visible" : "" }`}
      style={{ marginBottom: "2rem" }}
    >
      <h2 className="title">Compétences</h2>

      {/* Boucle sur chaque catégorie */}
      {Object.entries(skillsData).map(([category, skills], categoryIndex) => (
        <div key={category} style={{ marginBottom: "1.5rem", justifyContent:"center" }}>
          <h4 style={{ marginBottom: '0.5rem', textAlign: "center"  }}>
            <strong>{category}</strong>
          </h4>

          {/* --- Marquee pour TOUTES les catégories --- */}
          <div className="skills-marquee" style={{ overflow: 'hidden' }}>
               <Marquee
                  gradient={false}
                  speed={60 + (categoryIndex % 3) * 5}
                  pauseOnHover={true}
                  // --- > Direction Alternée <---
                  direction={categoryIndex % 2 === 0 ? 'left' : 'right'} // Pair=gauche, Impair=droite
                  autoFill={true} 
               >
                  {/* Boucle pour générer les badges DANS le Marquee */}
                  {skills.map((skill, skillIndex) => {
                      const colorClass = badgeColors[(categoryIndex + skillIndex) % badgeColors.length];
                      return (
                        // Badge avec marge droite pour l'espacement
                        <div
                          className="nes-badge"
                          key={skill}
                          style={{ marginRight: '3rem',marginLeft: '3rem' }} // Espace entre badges
                        >
                          <span className={colorClass}>{skill}</span>
                        </div>
                      );
                  })}
                  {/* Espace vide à la fin */}
                  <div style={{ marginRight: '3rem',marginLeft: '3rem' }}>&nbsp;</div>
               </Marquee>
          </div>
          {/* --- Fin Marquee --- */}

        </div>
      ))}
    </section>
  );
}

export default Skills;