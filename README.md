```
👩  This project is not associated officially with Passbolt
⚗️   It is used to illustrate an article or as a conversation starter.
🧪  Use at your own risks!
```


# Offline Password Reader for Passbolt

This is an offline password reader CLI to interact with Passbolt. It is aimed to administrator that are performing scheduled databases exports and to their passbolt users that want to access their passbolt offlines.

## Prerequisites
### Administrators
- [Node.js](https//nodejs.org/en)
- [Passbolt Server](https://help.passbolt.com/hosting/install)
- Access to the MySQL database with read and write privileges
### Users
- [Node.js](https//nodejs.org/en)
- [Docker](https://www.docker.com/products/docker-desktop/)
- Private key and the passphrase associated from the passbolt account
- Encrypted dump of the database related to the passbolt account 

## Installation
1. Clone the repository
    ```bash
    git clone https://github.com/qntoni/offline-password-reader-for-passbolt 
    ```
   
2. Install the dependancies
    ```bash
    cd offline-password-reader-for-passbolt
    npm install 
    ```
   
### Administrators
- Update `./env` with the correct database credentials

### Users
- Preferably import the dump of the encrypted database that has been shared by the administrator and the passbolt private key to the data folder with `mkdir data` 

## Usage

### Administrators
- Run `node src/admin/main.js`
- It should create an `./exports` folder
  - Inside this folder, you should have all the encrypted JSON for each users with their data that has been encrypted using their GPG public key stored in the passbolt database

### Users
#### WARNING
🚨⚠️  Since the CLI is running on the terminal, it will display sensitive data such as decrypted secrets and decrypted descriptions, **please use the dedicated docker image**

If you still want to run it manually in your client terminal 🤠 
1. Disable the shell history: `set +o history`
2. Run the CLI: `node src/cli/main.js`
3. After exiting the CLI
    - Clear the outputs: `clear`
    - Re-enable the history: `set -o history`

#### CLI
#### Prerequisites
- Create a data folder: `mkdir data`
  - Inside this folder, import:
    - Your private key as `private.key`
    - Your encrypted JSON as `encrypted.json.gpg`

‼️ **Theses files are mounted in docker-compose.yml so if you are changing the destination, you'll have to update the docker-compose accordingly**

##### Using the CLI
- Run `docker-compose run --rm user-cli`
- Enter the path where the private key is stored *(default: ./private.key)*
- Enter the passphrase of your `private.key`
- Enter the path of the encrypted JSON file that the administrator shared with you *(default: ./encrypted.json.gpg)*
- It should let you perform offline operations
  - Display all the passwords **(Resource name, username, URI, Password, Description)**
  - Search for a specific password which will match with either the resource name, username or URI
  - Exit to quit the CLI and destroy the docker image
