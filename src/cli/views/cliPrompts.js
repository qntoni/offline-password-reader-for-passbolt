import inquirer from 'inquirer';

export async function Warning() {
    return inquirer.prompt([
        {
            type: 'confirm',
            name: 'acknowledge',
            message: `Warning: Sensitive information may be exposed during this session. 
To ensure security:
1. Disable your shell history by running: \`set +o history\`.
2. After the session, remember to re-enable history by running: \`set -o history\`.

Do you acknowledge and wish to proceed?`,
            default: false
        }
    ]);
}

export async function getPrivateKeyAndPassphrase() {
    return inquirer.prompt([
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
        }
    ]);
}

export async function getUserFileInput() {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'userFile',
            message: 'Provide the path to your encrypted JSON file:',
            default: './user.json.gpg'
        }
    ]);
}

export async function getAction() {
    return inquirer.prompt({
        type: 'list',
        name: 'action',
        message: 'Choose an action:',
        choices: ['Search for a password', 'Display all passwords', 'Exit']
    });
}

export async function getSearchQuery() {
    return inquirer.prompt({
        type: 'input',
        name: 'query',
        message: 'Enter search term (name, username, or URI):'
    });
}
