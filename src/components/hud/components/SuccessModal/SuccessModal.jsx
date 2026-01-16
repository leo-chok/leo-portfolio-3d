import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket, faCheck } from '@fortawesome/free-solid-svg-icons'
import { useAudioStore } from '../../../../stores/audioStore'
import './SuccessModal.css'

/**
 * SuccessModal - Victory modal when all sections are discovered
 * Reward: Access to patrol spaceship flight mode
 * 
 * Props:
 * - isOpen: boolean - whether to show the modal
 * - onClose: function - callback to close the modal
 * - onLaunchSpaceship: function - callback to launch the spaceship
 */
export const SuccessModal = ({ isOpen, onClose, onLaunchSpaceship }) => {
    // Play notification sound when modal opens
    useEffect(() => {
        if (isOpen) {
            useAudioStore.getState().playNotification()
        }
    }, [isOpen])
    
    if (!isOpen) return null
    
    const handleLaunch = (e) => {
        e.stopPropagation()
        onLaunchSpaceship?.()
        onClose()
    }
    
    return createPortal(
        <div className="success-modal">
            <div 
                className="success-modal__backdrop" 
                onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                }} 
            />
            <div className="success-modal__content" onClick={(e) => e.stopPropagation()}>
                
                {/* Status indicator */}
                <div className="success-modal__status">
                    <FontAwesomeIcon icon={faCheck} />
                    <span>MISSION COMPLETE</span>
                </div>
                
                {/* Icon - spaceship silhouette */}
                <div className="success-modal__icon">
                    <FontAwesomeIcon icon={faRocket} />
                </div>
                
                <div className="success-modal__title">SYSTEME DECRYPTE</div>
                <div className="success-modal__subtitle">// REWARD UNLOCKED</div>
                
                <div className="success-modal__message">
                    Félicitations, explorateur. Vous avez découvert toutes les sections de ce système stellaire.
                </div>
                
                <div className="success-modal__reward">
                    <div className="success-modal__reward-label">NOUVELLE CAPACITE DISPONIBLE</div>
                    <div className="success-modal__reward-name">VAISSEAU DE PATROUILLE</div>
                    <div className="success-modal__reward-desc">
                        Prenez les commandes et explorez l'espace librement
                    </div>
                </div>
                
                <div className="success-modal__actions">
                    <button 
                        className="success-modal__button success-modal__button--secondary"
                        onClick={(e) => {
                            e.stopPropagation()
                            onClose()
                        }}
                    >
                        PLUS TARD
                    </button>
                    <button 
                        className="success-modal__button success-modal__button--primary"
                        onClick={handleLaunch}
                    >
                        <FontAwesomeIcon icon={faRocket} />
                        <span>LANCER LE VOL</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
