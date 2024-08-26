import { getConnection } from '../../config/database.js';

export async function getUserGpgKey(username) {
    const connection = await getConnection();

    const [gpgKeyRows] = await connection.execute(`
        SELECT armored_key FROM gpgkeys WHERE user_id = (
            SELECT id FROM users WHERE username = ?
        )`, [username]);

    await connection.end();
    return gpgKeyRows.length > 0 ? gpgKeyRows[0].armored_key : null;
}

export async function getUserSecrets(username) {
    const connection = await getConnection();

    const [rows] = await connection.execute(`
        SELECT r.name, r.username, r.uri, r.description, s.data, s.created, s.modified, u.username 
        FROM secrets AS s 
        JOIN users AS u ON u.id = s.user_id 
        JOIN resources AS r ON r.id = s.resource_id 
        WHERE u.username = ?`, [username]);

    await connection.end();
    return rows;
}

export async function getAllUsernames() {
    const connection = await getConnection();

    const [users] = await connection.execute(`SELECT username FROM users`);
    await connection.end();

    return users.map(user => user.username);
}
