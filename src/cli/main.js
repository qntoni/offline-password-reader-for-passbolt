import {getPrivateKeyAndPassphrase, getUserFileInput, Warning} from './views/cliPrompts.js';
import { decryptUserFile } from './services/decryptionService.js';
import { handleCli } from './controllers/passwordController.js';

async function startCli() {
    try {
        const { acknowledge } = await Warning();

        if (!acknowledge) {
            console.log('Exiting for security reasons.');
            return;
        }

        const { privateKeyFile, passphrase } = await getPrivateKeyAndPassphrase();

        const { userFile } = await getUserFileInput();

        const { secrets, privateKey } = await decryptUserFile(privateKeyFile, passphrase, userFile);
        await handleCli(secrets, privateKey);
    } catch (err) {
        console.error(`Error: ${err.message}`);
    }
}

startCli();
