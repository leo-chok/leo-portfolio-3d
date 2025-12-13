/**
 * Projects Data - Portfolio projects with details
 * Used by ContentManager to display project information
 */
export const projects = [
    {
        id: 'toothy',
        title: "Toothy",
        description: "Application mobile ludique pour suivre l'assiduité au brossage des dents. Gamification avec système de points et tableau de bord statistiques sur l'hygiène dentaire.",
        image: "/images/toothy.gif",
        github: "https://github.com/leo-chok/toothbrush-tracker-app",
        demo: "https://expo.dev/preview/update?message=Add%20musics%20for%20brushing%20sessions&updateRuntimeVersion=1.0.0&createdAt=2025-04-21T15%3A43%3A22.738Z&slug=exp&projectId=1bdebab6-5a46-4760-9c95-7cfe1e5b9900&group=28b791ed-d58a-45bf-b8de-7c1913884132",
        stack: ["React Native", "Expo", "Node.js", "Express", "MongoDB"]
    },
    {
        id: 'jambonbeurre',
        title: "JambonBeurre",
        description: "Application mobile pour trouver des compagnons de repas et éviter de manger seul. Développé en équipe de 5 développeurs avec accent sur la simplicité et l'interaction temps réel.",
        image: "/images/jambonbeurre.gif",
        github: "https://github.com/leo-chok/jambonbeurre_beta_frontend",
        demo: "https://youtu.be/CRcOUVc1OcA",
        video: true,
        stack: ["React Native", "Expo", "Node.js", "Express", "MongoDB"]
    },
    {
        id: 'keepgoals',
        title: "KeepGoals",
        description: "Application web fullstack pour suivre vos objectifs financiers personnels et concrétiser vos projets de vie. Définissez vos objectifs, enregistrez vos contributions et visualisez votre progression en temps réel.",
        image: "/images/keepgoals.png",
        github: "https://github.com/leo-chok/financial-dashboard/tree/main",
        demo: "https://financial-dashboard-frontend-chi.vercel.app/",
        stack: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "MongoDB"]
    },
    {
        id: 'pokedex',
        title: "Pokedex",
        description: "Mini site pour s'entraîner sur React et les composants, relié à une API Web Service pour créer les cartes Pokémon et afficher leurs informations.",
        image: "/images/pokedex.gif",
        github: "https://github.com/leo-chok/pokedex-react-fr",
        demo: "https://pokedex-react-fr.vercel.app/",
        stack: ["React", "Node.js", "Express", "MongoDB", "API REST"]
    },
    {
        id: 'clickit',
        title: "ClickIt!",
        description: "Mini-jeu de clic avec tableau des scores. Créé pour s'entraîner à la mise en place du backend, MongoDB et la manipulation du DOM.",
        image: "/images/clickit.gif",
        github: "https://github.com/leo-chok/clickit-front",
        demo: "https://clickit-front.vercel.app/",
        stack: ["Node.js", "Express", "MongoDB", "HTML", "CSS", "JavaScript"]
    }
]
