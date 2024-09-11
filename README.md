```
👩  This project is not associated officially with Passbolt
⚗️   It is used to illustrate an article or as a conversation starter.
🧪  Use at your own risks!
```

# Offline Passwords Access


The purpose of this guide is to help administrators for disaster recovery scenarios, presenting a possible workaround for gaining immediate offline access to their passwords while using SQL backups.

In this hypothetical scenario we will assume that the Passbolt web extension or application server is temporarily unavailable, but that you still have access to the database (or have working backups that you can load into a fresh database server for example).

**This is a proof of concept to help you plan for the worst case scenarios and get some additional knowledge about your data in passbolt.**

Although this project streamlines the offline password access process, it still requires a basic understanding of database queries, encryption methods, and command-line interfaces, making it more suitable for tech-savvy users and administrators.

## Potential server failing issues
Even in well-managed systems, there are situations where the Passbolt UI or other components of the server may go down, but where the database is still running.

### NGINX failure
Passbolt typically runs with a web server, if it crashes due to misconfiguration, software bugs, or memory exhaustion, the Passbolt UI will become inaccessible. However, the MySQL or MariaDB database that stores the encrypted passwords remains operational, allowing for direct database access.
Application layer failure
Passbolt relies on PHP and other services to render its UI and perform user actions. If there’s an issue with PHP e.g., a misconfigured PHP module, or the PHP-FPM service crashes, the web application itself might stop responding. Despite this, the database backend could still be running and accessible, since it operates independently of the PHP services.

### High traffic
In cases where the Passbolt server is under heavy load (such as a surge in user activity), the application and web server components might fail to handle requests efficiently. However, the database often runs separately and could continue functioning normally, enabling direct access to data via command-line tools.

### Network misconfiguration
If there is a network misconfiguration or a firewall rule that unintentionally blocks HTTP traffic, the Passbolt UI will not be accessible. Despite this, internal network access to the database may still be available, allowing administrators to export data.

## What happens when you currently need to manually decrypt secrets from the database?
If you need to manually export and decrypt the secrets from the database without this project. It can be time consuming and it might not be the easiest method for the non-technical users. In this section, we’ll walk through how administrators can manually export resources and how users can decrypt their specific passwords using their private key.

### Administrators: Query the database
Administrators would have to connect to the passbolt database and retrieve the encrypted password data for specific users.

```mysql
SELECT r.name, r.username, r.uri, r.description, s.data, s.created, s.modified, u.username
FROM secrets as s
JOIN users as u ON u.id = s.user_id
JOIN resources as r ON r.id = s.resource_id
WHERE u.username = 'USER_EMAIL';
```

When the administrators replace `USER_EMAIL` with one of the passbolt users email addresses, this will output the following information:
- **Resource name:** The name of the resources (e.g., service or server).
- **Resource username:** The usernames associated with that resource.
- **Resource URI:** The resources’ URI (e.g., a URL).
- **Description:** Any unencrypted descriptions associated with the resource.
- **Encrypted secret:** The encrypted password or secret, stored in the s.data column.
- **Creation date:** The date when the secret was created.
- **Last modified date:** When the password was last updated.
- **Username:** The email of the user who owns the password.

**Note: In passbolt v5 these metadata will be encrypted, so the process will be different. This tutorial is only valid for <= v4.**

The data output could be exported for the user since the secrets are encrypted but again, this leads to might be up to the administrator e.g. *How do you share these outputs with the user? Do you want to share any other information such as the resource URi, name and so on? What happens if these data are intercepted from a man-in-the-middle attack?*

If the administrator want to also encrypt the resources metadata which are not encrypted in the database, the recommended way would be to encrypt the output using the user’s PGP public key that is available in the database

```mysql
SELECT u.username, g.armored_key
FROM users as u
INNER JOIN gpgkeys as g ON u.id = g.user_id
WHERE u.username ='USER_EMAIL;
```

Again, administrators will have to replace `USER_EMAIL` with the actual user's email address.

### Users: Decrypting the passwords
When the users receives the encrypted PGP message, he should copy the entire content to a file e.g. encrypted.gpg
```bash
echo "PGP_MESSAGE" > encrypted.gpg
```

The users should also ensure that their private key is available with `gpg –list-secret-keys` in their personal keyring otherwise they’ll have to import it with `gpg –import private_key.asc`

When the users confirmed that the private key is in their keyring, they’ll have to run the decryption command:
```bash
gpg --decrypt -o decrypted.gpg encrypted.gpg
```

This should decrypt the first layer of the output and should display the amount of resources the users have access to, so it can be a very long file. It is recommended to use `less` and `/` to find the resource name the user is looking for. Anyway, this is an example of how a resource should be displayed.
```
Resource name: Order 66
Resource username: anakin
Resource URI: https://empire.sw
Encrypted secret: -----BEGIN PGP MESSAGE-----...
Created: 2023-09-01
Modified: 2023-09-05
Username: anakin@passbolt.com
```

Then, users would have to copy the PGP message which is the encrypted secret into another file.

```bash
echo "PGP_MESSAGE" > r.order66.encrypted.pgp
```

It will be the same decryption process for the encrypted secret but the output will be slightly different

```json
{
"description": "Encrypted description",
"password": "P4ss0wrd!"
}
```

With all these steps, the user can proceed again and again to decrypt all of the passwords he needs. Still, this doesn’t mean that it could not be intercepted once decrypted, so it must be done carefully, don’t forget that with great powers comes great responsibility.

## Automating the process with this project
### Experimentation purposes only!
This project is intended as a lab setup, allowing administrators and users to experiment with accessing their encrypted Passbolt passwords in offline environments. It is important to understand that this tool is not meant to replace Passbolt’s robust server-side application. Instead, it’s designed to explore the possibilities of extending Passbolt's utility for specific use cases where offline access may be needed.

#### Security Risks
While this tool provides a convenient way to access passwords offline, it's important to be aware of the potential security risks:

- **Password Exposure:** Exporting passwords from the Passbolt database for offline access requires utmost care. While the data is encrypted, improper handling or storage of these files could expose sensitive information.
- **Private key mismanagement:** The tool relies on users’ private keys to decrypt their passwords. If these keys are not stored securely, they could fall into the wrong hands, compromising the entire system.
- **Offline environment risks:** Running the decryption process in environments that are not fully isolated such as outside of a Docker container can expose passwords to other processes or users on the system.

For these reasons, this lab setup should be used with test data only, or cautiously in environments that are specifically prepared for secure operations.

## Administrators: Automated encryption process for each users
Rather than manually exporting and decrypting passwords, the project includes a script that automates the entire process, making it much more efficient.

### How does it work?
Instead of manually querying the database, handling encryption and decryption in multiple steps, it automates everything and produces organized, user-friendly outputs.

Export encrypted data for each user: The script automatically queries the Passbolt database and retrieves the necessary password data for each user, including metadata like resource names, usernames, and URLs.
Create encrypted JSON files for each user: Once the data is retrieved, the script generates a .json file for each user. These JSON files contain both unencrypted metadata and PGP-encrypted secrets.
Encrypt each user’s JSON file with their public keys: The script then encrypts each user’s JSON file using their public key. This ensures that only the intended user can decrypt their file. The final output is a file called user_email.json.gpg for each user.

### How to use the admin’s CLI ?
#### Pre-requisites
- [Node.js](https://nodejs.org/en/download/package-manager)
- Passbolt database accesses
- [GIT](https://git-scm.com/downloads)

#### Set up the environment
Before proceeding to the next step, administrators need to ensure that they’ve created a MySQL user with the right permissions to be able to log in through their client. This means that on the server, the file /etc/mysql/mariadb.conf.d/50-server.cnf has to be edited. What we are targeting here is the bind-address attributes. We would like to update it to 0.0.0.0 where it should be 127.0.0.1 by default. Unfortunately, this is not possible to bind multiple addresses and that’s why we’d have to bind 0.0.0.0 to allow all IPs.

```bash
bind-address	=	0.0.0.0
```


However, this doesn’t mean that anybody could log in into MySQL, we still have to create the user with the right ip and permissions. After that, MySQL should be restarted with `sudo systemctl restart mysql`

After logging in to MySQL with enough privileges, administrators have to create a dedicated user for their client:

```mysql
CREATE USER 'DB_USE'R@'CLIENT_IP' IDENTIFIED BY 'DB_PASSWORD';
GRANT ALL PRIVILEGES ON DB_NAME.* TO 'DB_USER'@'CLIENT_IP';
FLUSH PRIVILEGES;
```

Placeholders must be updated with the right one, *CLIENT_IP* has to be set according to their local machine and where they are executing the CLI from e.g. on Linux that’d be `ip a` to see the list of the local IPs.

After cloning the repository and creating the database users for their client IP, the administrator must create a *.env* file based on the *.env.example* with the correct database credentials that has been set above for their client. This allows the script to securely access the database and retrieve the necessary data.

```env
DB_HOST=THE HOST OF THE DBMS
DB_USER=THE USER WITH THE RIGHT CLIENT IP ON THE PASSBOLT DATABASE
DB_PASSWORD=USER'S PASSWORD
DB_NAME=PASSBOLT DATABASE NAME
```
To increase the security, it is recommended to run `chmod 600 .env`

#### Run the automated export and encryption script
After ensuring that the environment is set up and credentials are configured, the administrator can run the script to automatically export and encrypt the necessary data for each user.

```bsah
npm ci 
node src/admin/main.js
```

#### Encrypted files destination
After running the script, it should create an exports folder in the root directory of the project. Inside this folder, the encrypted JSONs files should be there as well, the administrator must ensure that each user receives their respective files. The administrator will have multiple .json.gpg files, each named according to the user’s email. It’s crucial that the right file is shared with the correct user even though without the related private key, it won’t be decryptable.
To give a concrete example, the file kylo@passbolt.com.json.gpg must be securely shared with Kylo Ren, if Han Solo tries to decrypt it, he won't be able to do it without Kylo's private key and passphrase.

<video width="640" height="480" controls>
  <source src="./demo/admin_cli.webm" type="video/webm">
  Your browser does not support the video tag.
</video>


## Users: Decryption and access to the decrypted passwords
As you’ve seen in the earlier chapters, decrypting secrets manually can be quite a complex process for users. To simplify this and ensure everything is done securely, the script we’ve provided allows users to decrypt their JSON file and access their passwords without the need to manually handle raw database data.

### How does it work?
When users receive their encrypted JSON file from the administrator, they can decrypt it using their private key and the associated passphrase. The script handles the decryption process and presents the data in a user-friendly format.

- **Decrypt their encrypted JSON file:** Using their private key and the passphrase associated, they use the provided script to decrypt the file and gain access to their passwords and metadata.
- **View and filters passwords:** After decryption, the user can view their data in a readable format, which includes all their stored passwords along with the resource names, usernames, and other relevant metadata

### How to use the user’s CLI ?
To ensure maximum security during the decryption process, the CLI is designed to run inside a dedicated Docker container. This approach minimizes the risk of exposing sensitive data like decrypted secrets to the user’s terminal. Once the Docker container finishes the operation, it is automatically removed using the `--rm` option, ensuring that no data persists beyond the session.

#### Pre-requisites
- [Docker](https://docs.docker.com/get-started/get-docker/)
- [GIT](https://git-scm.com/downloads)

#### Set up the environment
After cloning the repository, the user must create a data folder inside the root directory of the project to store their private key and encrypted JSON file. These files will be used inside the Docker container for decryption.

Inside the data folder:
- The private key as private.key.
- The encrypted JSON file as encrypted.json.gpg

These file paths are mounted in the *./docker-compose.yml* file. If it moves or the name is not correct, make sure to update the docker-compose configuration accordingly. To increase the security, it is recommended to run `chmod 600 data/*`

#### Run the dedicated docker container
To start the CLI securely, users can run the following command:

```bash
docker-compose run --rm user-cli
```


Inside the container, the user will be prompted to:
- Enter the path of the private key **default is ./private.key.**
- Enter the passphrase for the private key.
- Enter the path of the encrypted JSON file **default is ./encrypted.json.gpg.**

These prompts guide the user through the decryption process securely within the container.

When the decryption is successfully done, the user will be able to:
- View all passwords, including resource names, usernames, URIs, descriptions, and decrypted passwords.
- Search for specific passwords by resource name, username, and URI.

**Note:** When users are exiting the CLI, the container is automatically destroyed.

<video width="640" height="480" controls>
  <source src="./demo/user_cli.webm" type="video/webm">
  Your browser does not support the video tag.
</video>


## Going further: Handling database downtime
While this guide focuses on situations where the Passbolt UI or application layer is down but the database remains accessible, there are additional steps that could be taken to handle scenarios where the database itself becomes unreachable. Although this hasn't been covered in detail here, it's worth considering how to maintain offline password access in the event of a database failure.

### Using SQLite for offline access
For full offline functionality, we could extend the lab project by creating a lightweight solution using SQLite. The idea is to allow administrators to periodically export password data from Passbolt and store it safely. In case of an emergency, this data can be used to operate a local password management system, completely independent of the main Passbolt server and database.
- **Automated SQL exports:** Administrators could schedule daily or hourly exports using Passbolt’s built-in command ./bin/cake sql_export
  - This command creates a complete dump of the entire Passbolt database, not just the resources.
- **Securing the exports:** The administrators would have to take care that the SQL dump is securely stored in a locale that’s accessible during emergencies, such as when the main server or containers are down.
- **Transforming data for SQLite:** In case of a server outage, the stored SQL dump is imported into a SQLite database using the script provided by the project. Once the SQL dump is loaded into SQLite, the script queries the SQLite database to extract the relevant encrypted secrets, GPG keys, and metadata required for the users to access their passwords.
- **Running SQLite and CLI in Docker:** After the SQLite database is prepared, the project runs a Docker container that houses both the SQLite database and the CLI tool. This container serves as a temporary local password management system. Users can then access their passwords by querying the local SQLite database via the CLI, just as they would with the online Passbolt system.

## Conclusion
For those already familiar with Passbolt, this project offers an extra layer of resilience and control over password access. It ensures that even during unexpected outages, your team can remain operational, accessing critical information with minimal disruption. 

For those who haven't yet tried Passbolt, it’s worth noting that Passbolt is a highly reliable and well-maintained password management system. Incidents of downtime are rare, and its strong encryption ensures that sensitive information is always protected. This project is a useful fallback in exceptional circumstances, but it’s important to emphasize that with proper maintenance, the likelihood of encountering these kinds of issues is quite low.

Now that you have the knowledge and tools to handle such rare occurrences, you’re better prepared to face potential downtimes confidently. Whether you’re an administrator safeguarding your team or a tech enthusiast eager to try something new, Passbolt and this lab project offer a comprehensive approach to password security online and offline.


