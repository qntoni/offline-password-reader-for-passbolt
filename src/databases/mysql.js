import mysql from 'mysql2/promise';
import openpgp from 'openpgp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the exports directory exists
const exportDir = path.join(__dirname, '../../exports');
try {
    await fs.mkdir(exportDir, { recursive: true });
    console.log(`Created exports directory at ${exportDir}`);
} catch (err) {
    if (err.code !== 'EEXIST') {
        console.error(`Error creating exports directory: ${err.message}`);
    }
}

async function exportUserData(user) {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [gpgKeyRows] = await connection.execute(`
            SELECT armored_key FROM gpgkeys WHERE user_id = (
                SELECT id FROM users WHERE username = ?
            )`, [user.username]);

        if (gpgKeyRows.length === 0) {
            console.log(`No GPG key found for user ${user.username}`);
            await connection.end();
            return;
        }

        const armoredKey = gpgKeyRows[0].armored_key;

        const [rows] = await connection.execute(`
            SELECT r.name, r.username, r.uri, r.description, s.data, s.created, s.modified, u.username 
            FROM secrets AS s 
            JOIN users AS u ON u.id = s.user_id 
            JOIN resources AS r ON r.id = s.resource_id 
            WHERE u.username = ?`, [user.username]);

        await connection.end();

        if (rows.length > 0) {
            const publicKey = await openpgp.readKey({ armoredKey });

            const jsonString = JSON.stringify(rows);
            const encrypted = await openpgp.encrypt({
                message: await openpgp.createMessage({ text: jsonString }),
                encryptionKeys: publicKey,
            });

            const outputPath = path.join(exportDir, `${user.username}.json.gpg`);
            await fs.writeFile(outputPath, encrypted);
            console.log(`Exported and encrypted data for ${user.username}`);
        } else {
            console.log(`No data found for user ${user.username}`);
        }
    } catch (error) {
        console.error(`Error exporting data for ${user.username}:`, error.message);
    }
}

async function exportAllUsers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [users] = await connection.execute(`SELECT username FROM users`);
        await connection.end();

        console.log("Users retrieved from database:", users);

        for (let user of users) {
            console.log(`Processing user: ${user.username}`);
            await exportUserData(user);
        }
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
    }
}

exportAllUsers();
