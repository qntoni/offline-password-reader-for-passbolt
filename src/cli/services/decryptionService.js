import fs from 'fs/promises';
import openpgp from 'openpgp';

export async function decryptUserFile(privateKeyFile, passphrase, userFile) {
    try {
        const privateKeyArmored = await fs.readFile(privateKeyFile, 'utf8');
        const privateKey = await openpgp.decryptKey({
            privateKey: await openpgp.readKey({ armoredKey: privateKeyArmored }),
            passphrase: passphrase
        });

        if (!privateKey) {
            throw new Error('Incorrect key passphrase');
        }

        const encryptedData = await fs.readFile(userFile, 'utf8');
        const message = await openpgp.readMessage({ armoredMessage: encryptedData });

        const { data: decryptedData } = await openpgp.decrypt({
            message,
            decryptionKeys: privateKey
        });

        return { secrets: JSON.parse(decryptedData), privateKey };
    } catch (error) {
        if (error.message.includes('Error decrypting private key')) {
            throw new Error('Incorrect key passphrase');
        } else {
            throw error;
        }
    }
}

export async function decryptPassword(encryptedPassword, privateKey) {
    try {
        const message = await openpgp.readMessage({ armoredMessage: encryptedPassword });
        const { data: decryptedData } = await openpgp.decrypt({
            message,
            decryptionKeys: privateKey
        });
        return JSON.parse(decryptedData);
    } catch (error) {
        console.error(`Error decrypting password: ${error.message}`);
        return { password: 'Error decrypting password', description: 'N/A' };
    }
}
