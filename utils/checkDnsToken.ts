import * as dns from 'dns/promises';

/**
 * lorsqu'un site web s'incrit, il faut que l'on vérifie si le site existe et
 * que le contact est bien propriétaire du site.
 * il faudra donner un token qu'il devra mettre dans le TXT du dns et ensuite on le vérifie
 * une fois vérifier, on envoit par mail le authKEy
 */

export const checkDnsToken = async (
  hostname: string,
  expectedToken: string,
) => {
  try {
    const records = await dns.resolveTxt(hostname);
    const allRecords = records.flat();

    return allRecords.includes(expectedToken);
  } catch (err) {
    if (err.code === 'ENOTFOUND') {
      throw new Error('hostname nt found');
    }

    throw new Error('Erreur lors de la résolution DNS');
  }
};
