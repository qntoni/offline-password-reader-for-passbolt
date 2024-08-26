import fs from 'fs/promises';
import path from 'path';

export async function ensureDirectoryExists(directoryPath) {
    const resolvedPath = path.resolve(directoryPath);
    try {
        await fs.mkdir(resolvedPath, { recursive: true });
        console.log(`Created directory at ${resolvedPath}`);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            console.error(`Error creating directory: ${err.message}`);
        }
    }
}
