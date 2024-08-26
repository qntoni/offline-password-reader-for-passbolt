import fs from 'fs/promises';
import openpgp from 'openpgp';
import inquirer from 'inquirer';

async function decryptUserFile(privateKeyFile, passphrase, userFile) {
    const privateKeyArmored = await fs.readFile(privateKeyFile, 'utf8');
    const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readKey({ armoredKey: privateKeyArmored }),
        passphrase: passphrase
    });

    const encryptedData = await fs.readFile(userFile, 'utf8');
    const message = await openpgp.readMessage({ armoredMessage: encryptedData });

    const { data: decryptedData } = await openpgp.decrypt({
        message,
        decryptionKeys: privateKey
    });

    return { secrets: JSON.parse(decryptedData), privateKey };
}

async function startCli() {
    const questions = [
        {
            type: 'input',
            name: 'privateKeyFile',
            message: 'Provide your private GPG key file path:',
            default: './private.key'
        },
        {
            type: 'password',
            name: 'passphrase',
            message: 'Provide your passphrase:',
            mask: '*'
        },
        {
            type: 'input',
            name: 'userFile',
            message: 'Provide the path to your encrypted JSON file:',
            default: './user.json.gpg'
        }
    ];

    const { privateKeyFile, passphrase, userFile } = await inquirer.prompt(questions);

    try {
        const { secrets, privateKey } = await decryptUserFile(privateKeyFile, passphrase, userFile);
        await handleCli(secrets, privateKey);
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
}

async function handleCli(decryptedSecrets, privateKey) {
    let continueLoop = true;

    async function decryptPassword(encryptedPassword, privateKey) {
        const message = await openpgp.readMessage({ armoredMessage: encryptedPassword });
        const { data: decryptedData } = await openpgp.decrypt({
            message,
            decryptionKeys: privateKey
        });
        return JSON.parse(decryptedData);
    }

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

startCli();
