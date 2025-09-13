import NRP from 'node-redis-pubsub';

const config = {
  port: 6379, // Port de votre serveur Redis local
  scope: 'demo', // Utiliser un scope pour éviter que deux NRP ne partagent des messages
};

/**
 * Attend un payload sur un canal Redis (via eventID) et le retourne.
 * La fonction utilise une promesse pour encapsuler la logique d'écoute d'événement.
 * Elle inclut un timeout pour éviter une attente infinie.
 *
 * @template T Le type de données attendu dans le payload.
 * @param {string} eventID - L'identifiant de l'événement, utilisé comme nom de canal.
 * @param {number} [timeoutMs=30000] - Le temps d'attente maximum en millisecondes.
 * @returns {Promise<string>} Une promesse qui se résout avec le payload reçu.
 * @throws {Error} Rejette la promesse en cas de timeout ou d'erreur du client Redis.
 */
export function awaitPayloadFromMessage(
  eventID: string,
  timeoutMs = 30000,
): Promise<string> {
  const client = NRP(config);

  return new Promise<string>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      client.quit();
      reject(
        new Error(
          `Timeout: Aucun message reçu pour l'eventID "${eventID}" en ${timeoutMs}ms.`,
        ),
      );
    }, timeoutMs);

    client.on(eventID, (data) => {
      clearTimeout(timeoutId);
      client.quit();
      resolve(data);
    });

    // Gérer les erreurs de connexion Redis
    client.on('error', (err) => {
      clearTimeout(timeoutId);
      client.quit();
      reject(new Error(`Erreur du client Redis Pub/Sub: ${err}`));
    });
  });
}
