import inquirer from 'inquirer';
import { decryptPassword } from '../services/decryptionService.js';

export async function handleCli(decryptedSecrets, privateKey) {
    let continueLoop = true;

    while (continueLoop) {
        const { action } = await inquirer.prompt({
            type: 'list',
            name: 'action',
            message: 'Choose an action:',
            choices: ['Search for a password', 'Display all passwords', 'Exit']
        });

        switch (action) {
            case 'Search for a password':
                const { query } = await inquirer.prompt({
                    type: 'input',
                    name: 'query',
                    message: 'Enter search term (name, username, or URI):'
                });

                const results = decryptedSecrets.filter(secret => {
                    return secret.name.includes(query) ||
                        secret.username.includes(query) ||
                        secret.uri.includes(query);
                });

                if (results.length > 0) {
                    console.log('Search Results:');
                    for (const secret of results) {
                        const decryptedPasswordObj = await decryptPassword(secret.data, privateKey);
                        console.log(`Resource Name: ${secret.name}`);
                        console.log(`Username: ${secret.username}`);
                        console.log(`URI: ${secret.uri}`);
                        console.log(`Password: ${decryptedPasswordObj.password}`);
                        console.log(`Description: ${decryptedPasswordObj.description || 'Empty'}\n`);
                    }
                } else {
                    console.log('No results found.');
                }
                break;

            case 'Display all passwords':
                console.log('All Decrypted Secrets:');
                for (const secret of decryptedSecrets) {
                    const decryptedPasswordObj = await decryptPassword(secret.data, privateKey);
                    console.log(`Resource Name: ${secret.name}`);
                    console.log(`Username: ${secret.username}`);
                    console.log(`URI: ${secret.uri}`);
                    console.log(`Password: ${decryptedPasswordObj.password}`);
                    console.log(`Description: ${decryptedPasswordObj.description || 'Empty'}\n`);
                }
                break;

            case 'Exit':
                continueLoop = false;
                break;
        }
    }
}
