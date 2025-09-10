import WebSocket from 'ws';
import {
  ResponseFromPassprintDecryptedType,
  ResponseFromPassprintType,
} from './types';
import { getPrivateKey } from './getPrivateKey';
import { decryptDataWithPrivateKey } from './decryptDataWithPrivateKey';
import { checkPassprintSignature } from './checkPassprintSignature';

export async function connexionWithPassprintAndSendPayload(
  payload: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 3. Établir la connexion WebSocket sécurisée
    const ws = new WebSocket('wss://api.passprint.com/ws');

    // Mettre en place un timeout pour éviter une attente infinie
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('La connexion a expiré (timeout).'));
    }, 60000); // 1 minute

    // Fonction de nettoyage pour fermer la connexion et effacer le timeout
    const cleanup = () => {
      clearTimeout(timeout);
      ws.close();
      ws.removeAllListeners();
    };

    ws.onopen = () => {
      // 4. Envoyer le payload signé
      ws.send(payload);
    };

    ws.onmessage = async (event) => {
      try {
        // 5. Récupérer la réponse et la renvoyer
        const response = event.data.toString('utf8');

        cleanup();
        resolve(response);
      } catch (error) {}
    };

    ws.onclose = () => {
      cleanup();
      reject(new Error('La connexion WebSocket a été fermée inopinément.'));
    };

    ws.onerror = (error) => {
      cleanup();
      reject(error);
    };
  });
}
