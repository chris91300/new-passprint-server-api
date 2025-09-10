import crypto from 'crypto';
import { signDataWithPrivateKey } from './signDataWithPrivateKey';
import { getPrivateKey } from './getPrivateKey';

// On simule le module './getPrivateKey' pour contrôler son comportement.
jest.mock('./getPrivateKey');

// On "type" la fonction mockée pour que TypeScript soit satisfait.
const mockedGetPrivateKey = getPrivateKey as jest.Mock;

// On espionne console.error pour vérifier que les erreurs sont bien journalisées.
const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {});

describe('signDataWithPrivateKey', () => {
  let privateKey: string;
  let publicKey: string;

  // Avant tous les tests, on génère une vraie paire de clés pour les tests.
  beforeAll(() => {
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048, // Une taille plus petite pour des tests plus rapides
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    });
    privateKey = keyPair.privateKey;
    publicKey = keyPair.publicKey;
  });

  // On réinitialise les mocks avant chaque test.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sign data successfully with a valid private key', async () => {
    // Arrange : on configure le mock pour qu'il retourne notre clé privée de test.
    const dataToSign = 'This is some test data';
    mockedGetPrivateKey.mockResolvedValue(privateKey);

    // Act : on appelle la fonction à tester.
    const signature = await signDataWithPrivateKey(dataToSign);

    // Assert : on vérifie les résultats.
    // 1. getPrivateKey a bien été appelée.
    expect(mockedGetPrivateKey).toHaveBeenCalledTimes(1);

    // 2. La signature est une chaîne de caractères non vide au format base64.
    expect(typeof signature).toBe('string');
    expect(signature.length).toBeGreaterThan(0);
    const base64Regex =
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    expect(base64Regex.test(signature)).toBe(true);

    // 3. On vérifie que la signature est correcte en utilisant la clé publique correspondante.
    const verifier = crypto.createVerify('sha256');
    verifier.update(dataToSign);
    const isVerified = verifier.verify(publicKey, signature, 'base64');
    expect(isVerified).toBe(true);

    // 4. On s'assure qu'aucune erreur n'a été journalisée.
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it('should throw an error if getPrivateKey fails', async () => {
    // Arrange : on simule un échec de la récupération de la clé.
    const dataToSign = 'some data';
    const privateKeyError = new Error('Could not read private key file');
    mockedGetPrivateKey.mockRejectedValue(privateKeyError);

    // Act & Assert : on s'attend à ce que la fonction lève une erreur.
    await expect(signDataWithPrivateKey(dataToSign)).rejects.toThrow(
      `Failed to sign data: ${privateKeyError.message}`,
    );

    // On vérifie que l'erreur a bien été journalisée.
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error during data signing:',
      privateKeyError,
    );
  });

  it('should throw an error if the signing process fails due to an invalid key', async () => {
    // Arrange : on simule le retour d'une clé invalide.
    const dataToSign = 'some data';
    const invalidPrivateKey =
      '-----BEGIN RSA PRIVATE KEY-----\ninvalid-key\n-----END RSA PRIVATE KEY-----';
    mockedGetPrivateKey.mockResolvedValue(invalidPrivateKey);

    // Act & Assert : on s'attend à une erreur venant du module crypto.
    await expect(signDataWithPrivateKey(dataToSign)).rejects.toThrow(
      /Failed to sign data:/,
    );

    // On vérifie que l'erreur a été journalisée.
    // Alternative plus robuste pour la vérification
    expect(mockConsoleError).toHaveBeenCalledTimes(1); // On s'assure qu'il y a eu un seul appel.
    const [errorMessage, errorObject] = mockConsoleError.mock.calls[0]; // On récupère les arguments de l'appel.
    expect(errorMessage).toBe('Error during data signing:'); // On teste le premier argument.
    // On vérifie que l'objet est de type "Error" sans utiliser `instanceof` qui peut être problématique
    // à cause des contextes d'exécution différents (VM de Jest vs. module natif crypto).
    // On se contente de vérifier qu'il a les propriétés attendues d'une erreur.
    expect(errorObject).toBeDefined();
    expect(errorObject).toHaveProperty('message');
  });
});
