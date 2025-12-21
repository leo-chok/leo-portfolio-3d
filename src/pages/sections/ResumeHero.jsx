import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { presentation } from '../../data/presentation'
import './ResumeHero.css'

gsap.registerPlugin(ScrollTrigger)

/**
 * ResumeHero - Hero section with presentation data
 * 
 * Features:
 * - Name and title with typing effect
 * - Status badge
 * - About text with staggered reveal
 */
export const ResumeHero = () => {
    const heroRef = useRef(null)
    const nameRef = useRef(null)
    const titleRef = useRef(null)
    const statusRef = useRef(null)
    const aboutRef = useRef(null)
    
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial states
            gsap.set([nameRef.current, titleRef.current, statusRef.current], {
                opacity: 0,
                y: 30
            })
            
            // Hero entrance animation timeline
            const tl = gsap.timeline({
                defaults: { ease: 'power2.out' }
            })
            
            tl.to(nameRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.3
            })
            .to(titleRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.6
            }, '-=0.4')
            .to(statusRef.current, {
                opacity: 1,
                y: 0,
                duration: 0.6
            }, '-=0.3')
            
            // About paragraphs staggered animation
            const aboutItems = aboutRef.current?.querySelectorAll('.hero__about-item')
            if (aboutItems?.length) {
                gsap.set(aboutItems, { opacity: 0, y: 20 })
                
                ScrollTrigger.create({
                    trigger: aboutRef.current,
                    start: 'top 75%',
                    onEnter: () => {
                        gsap.to(aboutItems, {
                            opacity: 1,
                            y: 0,
                            duration: 0.5,
                            stagger: 0.15,
                            ease: 'power2.out'
                        })
                    }
                })
            }
        }, heroRef)
        
        return () => ctx.revert()
    }, [])
    
    // Parse HTML content safely
    const createMarkup = (html) => ({ __html: html })
    
    return (
        <section className="hero" ref={heroRef}>
            <div className="hero__content">
                {/* Name & Title */}
                <div className="hero__identity">
                    <h1 className="hero__name" ref={nameRef}>
                        {presentation.name}
                    </h1>
                    <div className="hero__titles" ref={titleRef}>
                        <span className="hero__title">{presentation.title}</span>
                        <span className="hero__title-separator">•</span>
                        <span className="hero__subtitle">{presentation.subtitle}</span>
                    </div>
                    <p className="hero__tagline">{presentation.tagline}</p>
                </div>
                
                {/* Status Badge */}
                <div className="hero__status" ref={statusRef}>
                    <div className="hero__status-badge">
                        <span className="hero__status-dot" />
                        <span className="hero__status-type">{presentation.status.type}</span>
                    </div>
                    <p className="hero__status-text">{presentation.status.text}</p>
                    <p className="hero__status-school">{presentation.status.school}</p>
                </div>
                
                {/* About Section */}
                <div className="hero__about" ref={aboutRef}>
                    {presentation.about.map((item, index) => (
                        <div 
                            key={index} 
                            className={`hero__about-item hero__about-item--${item.type}`}
                            dangerouslySetInnerHTML={createMarkup(item.text)}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
