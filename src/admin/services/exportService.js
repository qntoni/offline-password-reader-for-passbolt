import { getUserGpgKey, getUserSecrets, getAllUsernames } from '../repositories/userRepository.js';
import * as openpgp from 'openpgp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exportDir = path.resolve(__dirname, '../../../exports');

export async function exportUserData(username) {
    try {
        const armoredKey = await getUserGpgKey(username);

        if (!armoredKey) {
            console.log(`No GPG key found for user ${username}`);
            return;
        }

        const rows = await getUserSecrets(username);

        if (rows.length > 0) {
            const publicKey = await openpgp.readKey({ armoredKey });

            const jsonString = JSON.stringify(rows);
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

        for (const username of usernames) {
            console.log(`Processing user: ${username}`);
            await exportUserData(username);
        }
    } catch (error) {
        console.error('Error exporting users:', error.message);
    }
}
