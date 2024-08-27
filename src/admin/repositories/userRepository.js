import { getConnection } from '../../config/database.js';

export async function getUserGpgKey(username) {
    const connection = await getConnection();
    try {
        const [gpgKeyRows] = await connection.execute(`
            SELECT armored_key FROM gpgkeys WHERE user_id = (
                SELECT id FROM users WHERE username = ?
            )`, [username]);

        return gpgKeyRows.length > 0 ? gpgKeyRows[0].armored_key : null;
    } finally {
        await connection.end();
    }
}

export async function getUserSecrets(username) {
    const connection = await getConnection();
    try {
        const [rows] = await connection.execute(`
            SELECT r.name, r.username, r.uri, r.description, s.data, s.created, s.modified, u.username
            FROM secrets AS s
                     JOIN users AS u ON u.id = s.user_id
                     JOIN resources AS r ON r.id = s.resource_id
            WHERE u.username = ?`, [username]);

        return rows;
    } finally {
        await connection.end();
    }
}

export async function getUserSecretsInBatches(username, batchSize = 1000, offset = 0) {
    const connection = await getConnection();
    try {
        const [rows] = await connection.execute(`
            SELECT r.name, r.username, r.uri, r.description, s.data, s.created, s.modified, u.username 
            FROM secrets AS s 
            JOIN users AS u ON u.id = s.user_id 
            JOIN resources AS r ON r.id = s.resource_id 
            WHERE u.username = ?
            LIMIT ?, ?
        `, [username, offset, batchSize]);

        return rows;
    } finally {
        await connection.end();
    }
}

export async function getAllUsernames() {
    const connection = await getConnection();
    try {
        const [users] = await connection.execute(`SELECT username FROM users`);
        return users.map(user => user.username);
    } finally {
        await connection.end();
    }
}
