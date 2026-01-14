import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useInView } from '../../hooks/useInView'
import { useTranslation } from '../../hooks/useTranslation'
import { presentation as presentationData } from '../../data/presentation'
import './ResumeHero.css'

/**
 * ResumeHero - Hero section with presentation data
 * 
 * Features:
 * - Name and title with entrance animation
 * - Status badge
 * - About text with staggered reveal using Intersection Observer
 */
export const ResumeHero = () => {
    const { t } = useTranslation()
    const translatedPresentation = t('presentation')
    
    // Merge static data with translated data
    const presentation = {
        ...presentationData,
        name: translatedPresentation?.name || presentationData.name,
        title: translatedPresentation?.title || presentationData.title,
        subtitle: translatedPresentation?.subtitle || presentationData.subtitle,
        tagline: translatedPresentation?.tagline || presentationData.tagline,
        status: {
            ...presentationData.status,
            type: translatedPresentation?.status?.type || presentationData.status.type,
            text: translatedPresentation?.status?.text || presentationData.status.text,
            school: translatedPresentation?.status?.school || presentationData.status.school
        },
        about: translatedPresentation?.about || presentationData.about
    }
    const heroRef = useRef(null)
    const portraitRef = useRef(null)
    const nameRef = useRef(null)
    const titleRef = useRef(null)
    const statusRef = useRef(null)
    const aboutRef = useRef(null)
    const [aboutObserverRef, isAboutInView] = useInView({ threshold: 0.1 })
    const hasAboutAnimated = useRef(false)
    
    // Hero entrance animation (plays immediately on mount)
    useEffect(() => {
        const tl = gsap.timeline({
            defaults: { ease: 'power2.out' }
        })
        
        tl.to(portraitRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            delay: 0.2
        })
        .to(nameRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8
        }, '-=0.5')
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
        
        return () => tl.kill()
    }, [])
    
    // About section animation with Intersection Observer
    useEffect(() => {
        const aboutItems = aboutRef.current?.querySelectorAll('.hero__about-item')
        if (!aboutItems?.length) return
        
        if (isAboutInView && !hasAboutAnimated.current) {
            hasAboutAnimated.current = true
            gsap.to(aboutItems, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.15,
                ease: 'power2.out'
            })
        }
    }, [isAboutInView])
    
    // Parse HTML content safely
    const createMarkup = (html) => ({ __html: html })
    
    return (
        <section className="hero" ref={heroRef} id="hero">
            <div className="hero__panel">
                {/* Corner brackets */}
                <div className="hero__bracket hero__bracket--tl" />
                <div className="hero__bracket hero__bracket--tr" />
                <div className="hero__bracket hero__bracket--bl" />
                <div className="hero__bracket hero__bracket--br" />
                
                {/* Scanlines */}
                <div className="hero__scanlines" />
                
                <div className="hero__content">
                    {/* Name & Title */}
                    <div className="hero__identity">
                        <h1 
                            className="hero__name" 
                            ref={nameRef}
                            style={{ opacity: 0, transform: 'translateY(30px)' }}
                        >
                            {presentation?.name}
                        </h1>
                        <div 
                            className="hero__titles" 
                            ref={titleRef}
                            style={{ opacity: 0, transform: 'translateY(30px)' }}
                        >
                            <span className="hero__title">{presentation?.title}</span>
                            <span className="hero__title-separator">•</span>
                            <span className="hero__subtitle">{presentation?.subtitle}</span>
                        </div>
                        <p className="hero__tagline">{presentation?.tagline}</p>
                    </div>
                    
                    {/* Portrait - Mobile only (above status) */}
                    <div 
                        className="hero__portrait hero__portrait--mobile" 
                        ref={portraitRef}
                        style={{ opacity: 0, transform: 'scale(0.8)' }}
                    >
                        <div className="hero__portrait-frame">
                            <img 
                                src="/portrait.PNG" 
                                alt="Léo Stalhberger" 
                                className="hero__portrait-img"
                            />
                        </div>
                        <div className="hero__portrait-label">IDENTITY SCAN</div>
                    </div>
                    
                    {/* Status Badge */}
                    <div 
                        className="hero__status" 
                        ref={statusRef}
                        style={{ opacity: 0, transform: 'translateY(30px)' }}
                    >
                        <div className="hero__status-badge">
                            <span className="hero__status-dot" />
                            <span className="hero__status-type">{presentation?.status?.type}</span>
                        </div>
                        <p className="hero__status-text">{presentation?.status?.text}</p>
                        <p className="hero__status-school">{presentation?.status?.school}</p>
                    </div>
                    
                    {/* About Section */}
                    <div 
                        className="hero__about" 
                        ref={(el) => { aboutRef.current = el; aboutObserverRef.current = el }}
                    >
                        {(presentation?.about || []).map((item, index) => (
                            <div 
                                key={index} 
                                className={`hero__about-item hero__about-item--${item.type}`}
                                dangerouslySetInnerHTML={createMarkup(item.text)}
                                style={{ opacity: 0, transform: 'translateY(20px)' }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
