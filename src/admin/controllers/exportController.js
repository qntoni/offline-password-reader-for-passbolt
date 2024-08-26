import { exportUserData, exportAllUsers } from '../services/exportService.js';
import { ensureDirectoryExists } from '../utils/fileUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exportDir = path.resolve(__dirname, '../../../exports');

ensureDirectoryExists(exportDir).then(() => {
    console.log(`Ready to export data to ${exportDir}`);
}).catch((err) => {
    console.error(`Failed to ensure directory existence: ${err.message}`);
});

export async function generateUserFile(username) {
    try {
        await exportUserData(username);
    } catch (error) {
        console.error(`Error exporting data for user ${username}:`, error.message);
    }
}

export async function generateAllUserFiles() {
    try {
        await exportAllUsers();
    } catch (error) {
        console.error('Error exporting all user data:', error.message);
    }
}
