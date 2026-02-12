import React, { useState } from 'react';
import { Mail, X, CheckCircle, AlertCircle } from 'lucide-react';
import { subscribeEmail } from '../services/api';

const SubscriptionModal = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            await subscribeEmail(email);
            setStatus('success');
            setMessage('Merci ! Vous recevrez bientôt nos alertes environnementales.');
            setTimeout(() => {
                localStorage.setItem('hasSubscribed', 'true');
                onClose();
            }, 3000);
        } catch (error) {
            setStatus('error');
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                setMessage('Serveur injoignable (Port 8001). Vérifiez que le backend est lancé.');
            } else {
                setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
            }
        }
    };

    const handleSkip = () => {
        localStorage.setItem('hasSubscribed', 'dismissed');
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="subscription-modal">
                {status === 'success' ? (
                    <div className="modal-success">
                        <CheckCircle className="success-icon" size={48} />
                        <h2>Inscription Réussie</h2>
                        <p>{message}</p>
                    </div>
                ) : (
                    <>
                        <button className="modal-close" onClick={handleSkip}>
                            <X size={20} />
                        </button>
                        <div className="modal-header">
                            <div className="modal-icon-wrapper">
                                <Mail size={32} />
                            </div>
                            <h1>Restez Informé</h1>
                            <p>Recevez des alertes quotidiennes sur la qualité de l'air et la météo à Djibouti.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <input
                                type="email"
                                placeholder="votre.email@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={status === 'loading'}
                            />
                            <button
                                type="submit"
                                className={`subscribe-btn ${status === 'loading' ? 'loading' : ''}`}
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? 'Envoi...' : "S'abonner"}
                            </button>
                        </form>

                        {status === 'error' && (
                            <div className="modal-error">
                                <AlertCircle size={16} />
                                <span>{message}</span>
                            </div>
                        )}

                        <button className="skip-btn" onClick={handleSkip}>
                            Plus tard
                        </button>
                        <p className="modal-privacy">Nous respectons votre vie privée. Désabonnez-vous à tout moment.</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default SubscriptionModal;
