import React, { useEffect } from 'react';
import { usePostMessageHandler, requestLastGigId } from '../lib/postMessageHandler';
import Cookies from 'js-cookie';

export const PostMessageExample: React.FC = () => {
  const { lastGigId, lastMessage, sendConfirmation } = usePostMessageHandler({
    onGigCreated: (gigId) => {
      console.log('🎉 Nouveau gig créé reçu:', gigId);
      
      // Envoyer une confirmation
      sendConfirmation(gigId);
      
      // Vous pouvez ici déclencher d'autres actions
      // Par exemple: rediriger, mettre à jour l'UI, etc.
    }
  });

  // Fonction pour récupérer le Gig ID (priorité: postMessage > localStorage)
  const getLastGigId = (): string | null => {
    // 1. Essayer postMessage (le plus récent)
    if (lastGigId) {
      return lastGigId;
    }
    
    // 2. Essayer localStorage
    const fromLocalStorage = localStorage.getItem('lastGigId');
    if (fromLocalStorage) {
      return fromLocalStorage;
    }
    
    return null;
  };

  // Demander le dernier Gig ID au chargement
  useEffect(() => {
    // Attendre un peu puis demander le dernier Gig ID
    const timer = setTimeout(() => {
      requestLastGigId();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const currentGigId = getLastGigId();

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">📡 Communication PostMessage</h3>
      
      <div className="space-y-3">
        <div>
          <strong>Gig ID actuel:</strong> 
          <span className="ml-2 font-mono bg-blue-100 px-2 py-1 rounded">
            {currentGigId || 'Aucun'}
          </span>
        </div>
        
        {lastMessage && (
          <div className="bg-green-50 p-3 rounded border">
            <strong>Dernier message reçu:</strong>
            <pre className="text-sm mt-2 bg-white p-2 rounded">
              {JSON.stringify(lastMessage, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={() => requestLastGigId()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Demander le dernier Gig ID
          </button>
          
          {currentGigId && (
            <button
              onClick={() => sendConfirmation(currentGigId)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              ✅ Envoyer confirmation
            </button>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          <p>📋 Sources de données (par ordre de priorité):</p>
          <ol className="list-decimal list-inside ml-4">
            <li>PostMessage (temps réel)</li>
            <li>localStorage (persistant)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}; 