import { createPortal } from 'react-dom'
import './SuccessModal.css'

/**
 * SuccessModal - Victory modal when all sections are discovered
 * 
 * Props:
 * - isOpen: boolean - whether to show the modal
 * - onClose: function - callback to close the modal
 */
export const SuccessModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null
    
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
                <div className="success-modal__icon">🎉</div>
                <div className="success-modal__title">MISSION ACCOMPLIE</div>
                <div className="success-modal__subtitle">Système entièrement décrypté</div>
                <div className="success-modal__message">
                    Félicitations, explorateur ! Vous avez découvert toutes les sections de ce système stellaire.
                    Vous pouvez maintenant vous relaxer et contempler l'univers...
                </div>
                <button 
                    className="success-modal__button"
                    onClick={(e) => {
                        e.stopPropagation()
                        onClose()
                    }}
                >
                    CONTEMPLER
                </button>
            </div>
        </div>,
        document.body
    )
}
