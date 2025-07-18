import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface GigMessage {
  type: 'LAST_GIG' | 'LAST_GIG_ID_RESPONSE';
  data?: any;
  gigId?: string;
  timestamp?: number;
  source?: string;
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

      const { type, data, gigId, timestamp, source } = event.data;

      // Traiter les messages de type LAST_GIG
      if (type === 'LAST_GIG' && data && data._id) {
        console.log('📨 Message reçu:', { type, gigId: data._id, source, timestamp });
        
        setLastGigId(data._id);
        setLastMessage(event.data);
        
        // Appeler le callback si fourni
        if (onGigCreated) {
          onGigCreated(data._id);
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

// Utility functions for lastGigId management
/**
 * Gets the lastGigId with priority: cookies > localStorage > null
 * Cookies are the primary storage method with 30-day expiration
 * localStorage is used as fallback and automatically migrated to cookies
 * @returns The last gig ID or null if not found
 */
export const getLastGigId = (): string | null => {
  // Priority 1: Try cookies first
  const fromCookies = Cookies.get('lastGigId');
  if (fromCookies) {
    console.log('🍪 lastGigId found in cookies:', fromCookies);
    return fromCookies;
  }
  
  // Priority 2: Fallback to localStorage
  const fromLocalStorage = localStorage.getItem('lastGigId');
  if (fromLocalStorage) {
    console.log('💾 lastGigId found in localStorage:', fromLocalStorage);
    // Migrate to cookies for future use
    Cookies.set('lastGigId', fromLocalStorage, { 
      expires: 30,
      secure: true,
      sameSite: 'strict'
    });
    return fromLocalStorage;
  }
  
  console.log('❌ No lastGigId found in cookies or localStorage');
  return null;
};

/**
 * Saves the lastGigId to both cookies and localStorage
 * Cookies are set with 30-day expiration, secure flag, and strict sameSite
 * localStorage is maintained for backward compatibility
 * @param gigId The gig ID to save
 */
export const setLastGigId = (gigId: string): void => {
  // Save to cookies
  Cookies.set('lastGigId', gigId, { 
    expires: 30,
    secure: true,
    sameSite: 'strict'
  });
  
  // Also save to localStorage for backward compatibility
  localStorage.setItem('lastGigId', gigId);
  
  console.log('✅ lastGigId saved to cookies and localStorage:', gigId);
}; 