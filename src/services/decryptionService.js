import fs from 'fs/promises';
import openpgp from 'openpgp';

export async function decryptUserFile(privateKeyFile, passphrase, userFile) {
    const privateKeyArmored = await fs.readFile(privateKeyFile, 'utf8');
    const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readKey({ armoredKey: privateKeyArmored }),
        passphrase: passphrase
    });

    const encryptedData = await fs.readFile(userFile, 'utf8');
    const message = await openpgp.readMessage({ armoredMessage: encryptedData });

    const { data: decryptedData } = await openpgp.decrypt({
        message,
        decryptionKeys: privateKey
    });

    return { secrets: JSON.parse(decryptedData), privateKey };
}

export async function decryptPassword(encryptedPassword, privateKey) {
    const message = await openpgp.readMessage({ armoredMessage: encryptedPassword });
    const { data: decryptedData } = await openpgp.decrypt({
        message,
        decryptionKeys: privateKey
    });
    return JSON.parse(decryptedData);
}
