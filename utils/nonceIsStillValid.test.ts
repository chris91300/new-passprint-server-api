import { NonceDocument } from 'src/database/schemas/Nonce.schema';
import { nonceIsOverwhelmed } from './nonceIsStillValid';

describe('nonceIsOverwhelmed', () => {
  // On définit un point de référence temporel fixe pour nos tests.
  const MOCK_CURRENT_TIME = 1672531200000; // 2023-01-01 00:00:00 UTC

  // Avant tous les tests, on active les "fake timers" de Jest.
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(MOCK_CURRENT_TIME));
  });

  // Après tous les tests, on restaure les vrais timers.
  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return true for a nonce with a future expiration timestamp', () => {
    // Arrange: le nonce expire dans 5 secondes.
    const futureTimestamp = MOCK_CURRENT_TIME + 5000;
    // On simule un document Nonce avec juste la propriété nécessaire.
    const nonceDocument = { timestamp: futureTimestamp } as NonceDocument;

    // Act: on appelle la fonction.
    const isValid = nonceIsOverwhelmed(nonceDocument);

    // Assert: le nonce doit être valide.
    expect(isValid).toBe(true);
  });

  it('should return false for a nonce with a past expiration timestamp', () => {
    // Arrange: le nonce a expiré il y a 5 secondes.
    const pastTimestamp = MOCK_CURRENT_TIME - 5000;
    const nonceDocument = { timestamp: pastTimestamp } as NonceDocument;

    // Act
    const isValid = nonceIsOverwhelmed(nonceDocument);

    // Assert: le nonce ne doit pas être valide.
    expect(isValid).toBe(false);
  });

  it('should return false for a nonce that expires at the exact current time', () => {
    // Arrange: le nonce expire à l'instant T.
    const nowTimestamp = MOCK_CURRENT_TIME;
    const nonceDocument = { timestamp: nowTimestamp } as NonceDocument;

    // Act
    const isValid = nonceIsOverwhelmed(nonceDocument);

    // Assert: la condition est `now < timestamp`, donc si `now === timestamp`, le résultat est false.
    expect(isValid).toBe(false);
  });

  it('should throw an error if the nonce document is null', () => {
    // Arrange, Act & Assert
    // La fonction doit lever une erreur car on ne peut pas déstructurer `null`.
    // Le bloc catch de la fonction originale reformate le message d'erreur.
    expect(() => nonceIsOverwhelmed(null as any)).toThrow(
      "An error occurred while checking nonce validity: Cannot destructure property 'timestamp' of 'nonceDocument' as it is null.",
    );
  });

  it('should throw an error if the nonce document is undefined', () => {
    // Arrange, Act & Assert
    expect(() => nonceIsOverwhelmed(undefined as any)).toThrow(
      "An error occurred while checking nonce validity: Cannot destructure property 'timestamp' of 'nonceDocument' as it is undefined.",
    );
  });
});
