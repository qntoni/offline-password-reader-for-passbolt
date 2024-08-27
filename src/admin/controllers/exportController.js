import { exportUserData, exportAllUsers } from '../services/exportService.js';
import { ensureDirectoryExists } from '../utils/fileUtils.js';
import path from 'path';

const exportDir = path.resolve(process.cwd(), 'exports');

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
