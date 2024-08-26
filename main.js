import inquirer from 'inquirer';
import { decryptUserFile } from './src/cli/services/decryptionService.js';
import { handleCli } from './src/cli/controllers/passwordController.js';

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

startCli();
