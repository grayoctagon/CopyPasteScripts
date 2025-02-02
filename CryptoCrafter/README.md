
# CryptoCrafter (Hybrid Encryption Scripts)
[CryptoCrafter](CryptoCrafter/)

These are primarily example scripts for testing, combining and understanding the Windows functions for RSA and AES.

This repository contains two PowerShell scripts for secure file encryption and decryption using a hybrid encryption method that combines RSA and AES.

It can be used to encrypt files and transfer them in an unsecured or untrusted way, such as with a USB drive sent through the mail. The key must of course be transferred separately. And it is a bit less complex than a full professional encryption software (if that were needed, I would recommend [https://github.com/cryptomator/cryptomator](https://github.com/cryptomator/cryptomator) ). 

## Scripts Overview

### 1. **Encryption Script**
- **Purpose**: Encrypts files larger than 100kB in a specified directory and its subdirectories.
- **Process**:
  - Generates an RSA key pair (public/private) and saves them in PEM format.
  - Uses AES for file encryption.
  - Encrypts the AES key and IV with RSA and saves them alongside the encrypted file.
- **Output**:
  - Encrypted files (`<filename>.enc`).
  - RSA-encrypted AES keys (`<filename>.key`).
  - RSA-encrypted AES IVs (`<filename>.iv`).

### 2. **Decryption Script**
- **Purpose**: Restores the original files from their encrypted counterparts.
- **Process**:
  - Loads the RSA private key to decrypt the AES key and IV.
  - Decrypts the encrypted file content using AES.
  - Restores the original file with its original name.
- **Output**:
  - Decrypted files in their original format and filenames.

## How It Works
1. RSA ensures secure key exchange by encrypting the AES keys and IVs.
2. AES efficiently encrypts and decrypts large files for high performance.
3. The encryption and decryption scripts work together to maintain data integrity and security.

## Requirements
- PowerShell 5.1 or newer.
- A directory with files to encrypt (`encryptme` by default).

## Usage
1. **Run the Encryption Script**:
   - Save the `encrypt.ps1` script to your working directory.
   - Modify the `$DirectoryPath` variable if needed.
   - Execute the script to generate keys and encrypt files.

2. **Run the Decryption Script**:
   - Save the `decrypt.ps1` script to your working directory.
   - Ensure the RSA private key is present.
   - Execute the script to restore the original files.

## Notes
- Files larger than 245 bytes cannot be encrypted directly with RSA due to size limitations. Hybrid encryption resolves this by combining RSA and AES.
- Always keep your private key secure to prevent unauthorized decryption.



## License: 
Attribution-ShareAlike 4.0 International CC-BY-SA 

(details see LICENSE.txt file)

[![CC-BY-SA](https://i.creativecommons.org/l/by-sa/4.0/88x31.png)](#license)


