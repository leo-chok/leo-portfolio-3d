import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSatellite, faCompass } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from '../../../../hooks/useTranslation'
import './WelcomeModal.css'

/**
 * WelcomeModal - Introduction modal for the 3D exploration experience
 * Glassmorphism design with animated background lines
 * 
 * Props:
 * - isOpen: boolean - whether to show the modal
 * - onStart: function - callback when user clicks start exploration
 */
export const WelcomeModal = ({ isOpen, onStart }) => {
    const { t } = useTranslation()
    
    if (!isOpen) return null
    
    const handleStart = (e) => {
        e.stopPropagation()
        onStart?.()
    }
    
    return createPortal(
        <div className="welcome-modal">
            <div className="welcome-modal__backdrop" />
            <div className="welcome-modal__content" onClick={(e) => e.stopPropagation()}>
                
                {/* Status indicator */}
                <div className="welcome-modal__status">
                    <FontAwesomeIcon icon={faSatellite} />
                    <span>{t('ui.welcomeModal.status')}</span>
                </div>
                
                {/* Icon */}
                <div className="welcome-modal__icon">
                    <FontAwesomeIcon icon={faCompass} />
                </div>
                
                <div className="welcome-modal__title">{t('ui.welcomeModal.title')}</div>
                <div className="welcome-modal__subtitle">{t('ui.welcomeModal.subtitle')}</div>
                
                <div className="welcome-modal__message">
                    {t('ui.welcomeModal.message')}
                </div>
                
                <div className="welcome-modal__instructions">
                    <div className="welcome-modal__instruction-label">{t('ui.welcomeModal.instructionsLabel')}</div>
                    <div className="welcome-modal__instruction-text">
                        {t('ui.welcomeModal.instructions')}
                    </div>
                </div>
                
                <div className="welcome-modal__actions">
                    <button 
                        className="welcome-modal__button welcome-modal__button--primary"
                        onClick={handleStart}
                    >
                        <FontAwesomeIcon icon={faCompass} />
                        <span>{t('ui.welcomeModal.startButton')}</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
