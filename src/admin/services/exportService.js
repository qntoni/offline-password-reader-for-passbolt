import { getUserGpgKey, getUserSecretsInBatches, getAllUsernames } from '../repositories/userRepository.js';
import * as openpgp from 'openpgp';
import fs from 'fs/promises';
import path from 'path';

const exportDir = path.resolve(process.cwd(), 'exports');

export async function exportUserData(username) {
    try {
        const armoredKey = await getUserGpgKey(username);

        if (!armoredKey) {
            console.log(`No GPG key found for user ${username}`);
            return;
        }

        const publicKey = await openpgp.readKey({ armoredKey });

        let offset = 0;
        const batchSize = 1000;
        let allSecrets = [];

        do {
            const batch = await getUserSecretsInBatches(username, batchSize, offset);
            if (batch.length > 0) {
                allSecrets = [...allSecrets, ...batch];
                offset += batchSize;
            } else {
                break;
            }
        } while (true);

        if (allSecrets.length > 0) {
            const jsonString = JSON.stringify(allSecrets);
            const encrypted = await openpgp.encrypt({
                message: await openpgp.createMessage({ text: jsonString }),
                encryptionKeys: publicKey,
            });

            const outputPath = path.join(exportDir, `${username}.json.gpg`);
            await fs.writeFile(outputPath, encrypted);
            console.log(`Exported and encrypted data for ${username}`);
        } else {
            console.log(`No data found for user ${username}`);
        }
    } catch (error) {
        console.error(`Error exporting data for ${username}:`, error.message);
    }
}

export async function exportAllUsers() {
    try {
        const usernames = await getAllUsernames();

        console.log("Users retrieved from database:", usernames);

        await Promise.all(
            usernames.map(async (username) => {
                console.log(`Processing user: ${username}`);
                await exportUserData(username);
            })
        );

        console.log('All users processed.');
    } catch (error) {
        console.error('Error exporting users:', error.message);
    }
}
