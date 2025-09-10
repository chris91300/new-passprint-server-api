import { writeFile, chmod } from 'node:fs/promises';
import { join } from 'node:path';
import { savePrivateAndPublicKeyInFiles } from './savePrivateAndPublicKeyInFiles';
import { config } from './configurations';
import { type KeyPair } from './generatePrivateAndPublicKey';

// On simule (mock) le module 'node:fs/promises' pour ne pas écrire de vrais fichiers
jest.mock('node:fs/promises', () => ({
  // On garde les vraies implémentations pour les autres fonctions du module si besoin
  ...jest.requireActual('node:fs/promises'),
  writeFile: jest.fn(),
  chmod: jest.fn(),
}));

// On simule le module de configuration pour utiliser des chemins de test
jest.mock('./configurations', () => ({
  config: {
    privateKeyFile: {
      path: '/mock/path/test',
      name: 'mock_private_key.pem',
    },
    publicKeyFile: {
      path: '/mock/path/test',
      name: 'mock_public_key.pem',
    },
  },
}));

// On espionne les méthodes de la console pour vérifier les logs
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {});

// On "type" nos mocks pour que TypeScript soit content
const mockedWriteFile = writeFile as jest.Mock;
const mockedChmod = chmod as jest.Mock;

describe('savePrivateAndPublicKeyInFiles', () => {
  const mockKeys: KeyPair = {
    privateKey:
      '-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----',
    publicKey: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
  };

  const privateKeyPath = join(
    config.privateKeyFile.path,
    config.privateKeyFile.name,
  );
  const publicKeyPath = join(
    config.publicKeyFile.path,
    config.publicKeyFile.name,
  );

  beforeEach(() => {
    // On réinitialise tous les mocks avant chaque test pour éviter les interférences
    jest.clearAllMocks();
  });

  it('devrait sauvegarder les deux clés et définir les bonnes permissions en cas de succès', async () => {
    // Arrange : on s'assure que les fonctions simulées retournent une promesse résolue
    mockedWriteFile.mockResolvedValue(undefined);
    mockedChmod.mockResolvedValue(undefined);

    // Act : on appelle la fonction à tester
    await savePrivateAndPublicKeyInFiles(mockKeys);

    // Assert : on vérifie que tout a été appelé correctement
    // 1. Opérations sur la clé privée
    expect(mockedWriteFile).toHaveBeenCalledWith(
      privateKeyPath,
      mockKeys.privateKey,
      'utf8',
    );
    expect(mockedChmod).toHaveBeenCalledWith(privateKeyPath, 0o600);

    // 2. Opérations sur la clé publique
    expect(mockedWriteFile).toHaveBeenCalledWith(
      publicKeyPath,
      mockKeys.publicKey,
      'utf8',
    );
    expect(mockedChmod).toHaveBeenCalledWith(publicKeyPath, 0o644);

    // 3. Vérification du nombre d'appels
    expect(mockedWriteFile).toHaveBeenCalledTimes(2);
    expect(mockedChmod).toHaveBeenCalledTimes(2);

    // 4. Vérification des logs de succès
    expect(mockConsoleLog).toHaveBeenCalledWith(
      `Clé privée sauvegardée et permissions définies sur 600 : ${privateKeyPath}`,
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      `Clé publique sauvegardée et permissions définies sur 644 : ${publicKeyPath}`,
    );
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it("devrait lancer une erreur si l'écriture de la clé privée échoue", async () => {
    // Arrange : on simule une erreur lors de la première écriture
    const writeError = new Error('EACCES: permission denied');
    mockedWriteFile.mockRejectedValueOnce(writeError);

    // Act & Assert : on s'attend à ce que la fonction rejette la promesse avec une erreur spécifique
    await expect(savePrivateAndPublicKeyInFiles(mockKeys)).rejects.toThrow(
      `Échec de la sauvegarde des clés dans les fichiers : ${writeError.message}`,
    );

    // On vérifie que l'erreur a été loguée
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Erreur lors de la sauvegarde des clés :',
      writeError,
    );

    // On s'assure que les opérations suivantes n'ont pas eu lieu
    expect(mockedChmod).not.toHaveBeenCalled();
    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it('devrait lancer une erreur si le changement de permissions de la clé privée échoue', async () => {
    // Arrange : l'écriture réussit, mais le chmod échoue
    const chmodError = new Error('Operation not permitted');
    mockedWriteFile.mockResolvedValue(undefined);
    mockedChmod.mockRejectedValueOnce(chmodError);

    // Act & Assert
    await expect(savePrivateAndPublicKeyInFiles(mockKeys)).rejects.toThrow(
      `Échec de la sauvegarde des clés dans les fichiers : ${chmodError.message}`,
    );

    // On vérifie que l'erreur a été loguée
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Erreur lors de la sauvegarde des clés :',
      chmodError,
    );

    // On s'assure qu'aucun log de succès n'a été affiché
    expect(mockConsoleLog).not.toHaveBeenCalled();
  });
});
