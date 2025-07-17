import { useEffect, useState } from 'react';

interface GigMessage {
  type: 'GIG_CREATED' | 'LAST_GIG_ID_RESPONSE';
  gigId: string;
  timestamp: number;
  source: string;
}

interface PostMessageHandlerOptions {
  allowedOrigins?: string[];
  onGigCreated?: (gigId: string) => void;
}

export const usePostMessageHandler = (options: PostMessageHandlerOptions = {}) => {
  const [lastGigId, setLastGigId] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<GigMessage | null>(null);

  const {
    allowedOrigins = ['https://v25-gigsai.harx.ai'],
    onGigCreated
  } = options;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Vérifier l'origine pour la sécurité
      if (!allowedOrigins.includes(event.origin)) {
        console.warn('🚫 Message rejeté - origine non autorisée:', event.origin);
        return;
      }

      // Vérifier que le message a la bonne structure
      if (!event.data || typeof event.data !== 'object') {
        return;
      }

      const { type, gigId, timestamp, source } = event.data;

      // Traiter les messages de type GIG_CREATED
      if (type === 'GIG_CREATED' && gigId) {
        console.log('📨 Message reçu:', { type, gigId, source, timestamp });
        
        setLastGigId(gigId);
        setLastMessage(event.data);
        
        // Appeler le callback si fourni
        if (onGigCreated) {
          onGigCreated(gigId);
        }
      }
      
      // Traiter les réponses aux requêtes
      if (type === 'LAST_GIG_ID_RESPONSE' && gigId) {
        console.log('📨 Réponse reçue:', { type, gigId, source, timestamp });
        
        setLastGigId(gigId);
        setLastMessage(event.data);
        
        // Appeler le callback si fourni
        if (onGigCreated) {
          onGigCreated(gigId);
        }
      }
    };

    // Ajouter l'écouteur d'événements
    window.addEventListener('message', handleMessage);

    // Nettoyer l'écouteur
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [allowedOrigins, onGigCreated]);

  // Fonction pour envoyer un message de confirmation
  const sendConfirmation = (gigId: string) => {
    try {
      window.postMessage({
        type: 'GIG_RECEIVED',
        gigId,
        timestamp: Date.now(),
        source: 'v25.harx.ai'
      }, 'https://v25-gigsai.harx.ai');
      
      console.log('✅ Confirmation envoyée pour gigId:', gigId);
    } catch (error) {
      console.warn('⚠️ Erreur lors de l\'envoi de confirmation:', error);
    }
  };

  return {
    lastGigId,
    lastMessage,
    sendConfirmation
  };
};

// Fonction utilitaire pour envoyer un message
export const sendPostMessage = (
  targetOrigin: string,
  message: any
) => {
  try {
    window.postMessage(message, targetOrigin);
    console.log('📤 Message envoyé:', message);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du message:', error);
    return false;
  }
};

// Fonction pour demander le dernier Gig ID
export const requestLastGigId = () => {
  sendPostMessage('https://v25-gigsai.harx.ai', {
    type: 'REQUEST_LAST_GIG_ID',
    timestamp: Date.now(),
    source: 'v25.harx.ai'
  });
}; 