/**
 * Projects Data - Portfolio projects with details
 * Used by ContentManager to display project information
 * short_description = shown in cards
 * description = shown in full project view
 */
export const projects = [
    {
        id: 'hexavax',
        title: "Hexavax",
        subtitle: "Plateforme de prédiction des besoins vaccinaux",
        short_description: "Projet étudiant présenté à la Présidence de la République. Plateforme d'aide à la décision pour anticiper les besoins en vaccins grâce à la data et au machine learning.",
        description: "Projet étudiant présenté à la Présidence de la République. J'ai participé au développement d'Hexavax, une plateforme d'aide à la décision destinée à l'État et aux pharmaciens, permettant d'anticiper les besoins en vaccins grâce à la data et au machine learning. L'outil propose un dashboard de campagnes vaccinales, une carte interactive multi-niveaux (régions, départements, DOM-TOM), un slider temporel pour visualiser l'évolution passée et les prédictions futures, ainsi que 6 calques d'analyse (propagation virale, saturation hospitalière, centres de vaccination, populations vulnérables, zones de stockage, dépenses).",
        image: "/images/hexavax.png",
        github: "",
        demo: "https://www.youtube.com/watch?v=Sn1Yg1jge-U",
        stack: ["React", "Node.js", "Express", "MongoDB", "Python", "XGBoost"]
    },
    {
        id: 'jambonbeurre',
        title: "JambonBeurre",
        subtitle: "Application mobile de mise en relation pour partager ses repas",
        short_description: "Projet de fin de formation développé en équipe de 5. Application pour trouver des compagnons de repas et éviter de manger seul.",
        description: "Projet de fin de formation à La Capsule, développé en équipe de 5. J'ai contribué à la création de JambonBeurre, une application qui aide à trouver des compagnons de repas pour éviter de manger seul. Pensée pour les étudiants, salariés ou voyageurs, l'application mise sur la simplicité, l'expérience utilisateur et l'interaction en temps réel.",
        image: "/images/jambonbeurre.gif",
        github: "https://github.com/leo-chok/jambonbeurre_beta_frontend",
        demo: "https://youtu.be/CRcOUVc1OcA",
        video: true,
        stack: ["React Native", "Node.js", "Express", "MongoDB"]
    },
    {
        id: 'keepgoals',
        title: "KeepGoals",
        subtitle: "Application web de suivi d'objectifs financiers",
        short_description: "Application fullstack pour suivre ses objectifs financiers personnels et visualiser sa progression en temps réel.",
        description: "J'ai développé cette application fullstack pour suivre ses objectifs financiers personnels et concrétiser ses projets de vie. Achat immobilier, voyage, ou tout autre projet : KeepGoals permet de définir ses objectifs, enregistrer ses contributions et visualiser sa progression en temps réel via un tableau de bord intuitif.",
        image: "/images/keepgoals.png",
        github: "https://github.com/leo-chok/financial-dashboard/tree/main",
        demo: "https://financial-dashboard-frontend-chi.vercel.app/",
        stack: ["React", "Node.js", "Express", "MongoDB"]
    },
    {
        id: 'toothy',
        title: "Toothy",
        subtitle: "Application mobile ludique de suivi du brossage de dents",
        short_description: "Application mobile gamifiée pour encourager une bonne hygiène dentaire avec un système de points et statistiques.",
        description: "J'ai conçu cette application mobile gamifiée pour encourager une bonne hygiène dentaire, avec une cible jeune en tête. J'ai intégré un système de points, un tableau de bord avec statistiques personnalisées, et une interface ludique pour transformer le brossage en habitude positive.",
        image: "/images/toothy.gif",
        github: "https://github.com/leo-chok/toothbrush-tracker-app",
        demo: "https://expo.dev/preview/update?message=Add%20musics%20for%20brushing%20sessions&updateRuntimeVersion=1.0.0&createdAt=2025-04-21T15%3A43%3A22.738Z&slug=exp&projectId=1bdebab6-5a46-4760-9c95-7cfe1e5b9900&group=28b791ed-d58a-45bf-b8de-7c1913884132",
        stack: ["React Native", "Node.js", "Express", "MongoDB"]
    },
    {
        id: 'pokedex',
        title: "Pokedex",
        subtitle: "Mini-site de collection Pokémon",
        short_description: "Projet d'entraînement sur React et la consommation d'API pour afficher dynamiquement des cartes Pokémon.",
        description: "Projet d'entraînement sur React et la consommation d'API. J'ai créé ce site qui affiche dynamiquement des cartes Pokémon avec leurs informations, récupérées via une API Web Service.",
        image: "/images/pokedex.gif",
        github: "https://github.com/leo-chok/pokedex-react-fr",
        demo: "https://pokedex-react-fr.vercel.app/",
        stack: ["React", "API REST"]
    },
    {
        id: 'clickit',
        title: "ClickIt!",
        subtitle: "Minijeu web de clic avec classement",
        short_description: "Jeu simple de clic avec système de pseudo et tableau des scores. Projet d'entraînement backend.",
        description: "J'ai développé ce jeu simple où l'objectif est de cliquer le plus possible sur un bouton. Système de pseudo et tableau des scores pour se mesurer aux autres joueurs. Ce projet m'a permis de m'entraîner sur le backend, MongoDB et la manipulation du DOM.",
        image: "/images/clickit.gif",
        github: "https://github.com/leo-chok/clickit-front",
        demo: "https://clickit-front.vercel.app/",
        stack: ["HTML", "CSS", "JavaScript", "Node.js", "MongoDB"]
    },
    {
        id: 'leodesign3d',
        title: "LEO Design 3D",
        subtitle: "Rendus architecturaux photoréalistes",
        short_description: "Visualisations 3D pour architectes et professionnels de l'immobilier. Rendus photoréalistes et projections fidèles.",
        description: "En parallèle du développement, je réalise des visualisations 3D pour les architectes et professionnels de l'immobilier. Ces rendus permettent de préfigurer les espaces, d'accompagner la prise de décision et d'offrir une projection fidèle des projets avant leur construction.",
        image: "/images/leodesign3d.png",
        github: "",
        demo: "",
        stack: ["Blender", "SketchUp", "D5 Render", "Unreal Engine"]
    }
]
