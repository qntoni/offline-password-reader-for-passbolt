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
- Access to the MySQL database with READ/WRITE privileges
### Users
- [Node.js](https//nodejs.org/en)
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
- Preferably import the dump of the database that has been shared from the administrator and the passbolt private key to the root folder `./`

## Usage

### Administrators
- Run `node src/admin/main.js`
- It should create an `./exports` folder
  - Inside this folder, you should have all the encrypted JSON for each users with their data that has been encrypted using their GPG public key stored in the database

### Users
- Run `node src/cli/main.js`
- Enter the path where the private key is stored *(default: ./private.key)*
- Enter the passphrase of your `private.key`
- Enter the path of the encrypted JSON file that the administrator shared with you *(default: ./dump.json.gpg)*
- It should let you perform offline operations
  - Display all the passwords **(Resource name, username, URI, Password, Description)**
  - Search for a specific password which will match with either the resource name, username or URI
  - Exit to quit the CLI