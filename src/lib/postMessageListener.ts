import Cookies from 'js-cookie';
import { getLastGigId, setLastGigId } from './postMessageHandler';

interface PostMessageListenerOptions {
  allowedOrigins?: string[];
}

export const setupPostMessageListener = (options: PostMessageListenerOptions = {}) => {
  const { allowedOrigins = ['https://v25.harx.ai'] } = options;

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

    const { type, timestamp, source } = event.data;

    console.log('📨 Message reçu:', { type, source, timestamp });

    // Traiter les différents types de messages
    switch (type) {
      case 'REQUEST_LAST_GIG_ID':
        handleRequestLastGigId(event);
        break;
        
      case 'LAST_GIG':
        handleLastGig(event);
        break;
        
      default:
        console.log('❓ Type de message non reconnu:', type);
    }
  };

  const handleRequestLastGigId = (event: MessageEvent) => {
    // Use the new utility function to get lastGigId
    const lastGigId = getLastGigId();
    
    if (lastGigId) {
      // Envoyer la réponse
      event.source?.postMessage({
        type: 'LAST_GIG_ID_RESPONSE',
        gigId: lastGigId,
        timestamp: Date.now(),
        source: 'v25-gigsai.harx.ai'
      }, event.origin);
      
      console.log('📤 Dernier Gig ID envoyé:', lastGigId);
    } else {
      // Envoyer une réponse vide
      event.source?.postMessage({
        type: 'LAST_GIG_ID_RESPONSE',
        gigId: null,
        timestamp: Date.now(),
        source: 'v25-gigsai.harx.ai'
      }, event.origin);
      
      console.log('📤 Aucun Gig ID trouvé');
    }
  };

  const handleLastGig = (event: MessageEvent) => {
    const { data } = event.data;
    console.log('✅ Dernier gig reçu:', data);
    
    // Use the new utility function to save lastGigId
    if (data && data._id) {
      setLastGigId(data._id);
    }
    
    // Vous pouvez ajouter ici la logique pour traiter le gig reçu
    // Par exemple: mettre à jour l'UI, rediriger, etc.
  };

  const handleGigReceived = (event: MessageEvent) => {
    const { gigId } = event.data;
    console.log('✅ Confirmation reçue pour gigId:', gigId);
    
    // Vous pouvez ici effectuer d'autres actions
    // Par exemple: mettre à jour l'UI, envoyer des notifications, etc.
  };

  // Ajouter l'écouteur d'événements
  window.addEventListener('message', handleMessage);

  // Retourner une fonction pour nettoyer
  return () => {
    window.removeEventListener('message', handleMessage);
  };
};

// Fonction pour initialiser automatiquement l'écouteur
export const initPostMessageListener = (options?: PostMessageListenerOptions) => {
  console.log('🔧 Initialisation du listener PostMessage...');
  return setupPostMessageListener(options);
}; 