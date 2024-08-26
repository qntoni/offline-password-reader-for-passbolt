import fs from 'fs/promises';

export async function ensureDirectoryExists(directoryPath) {
    try {
        await fs.mkdir(directoryPath, { recursive: true });
        console.log(`Created directory at ${directoryPath}`);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            console.error(`Error creating directory: ${err.message}`);
        }
    }
}
