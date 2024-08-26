import inquirer from 'inquirer';

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
