# CopyPasteScripts
A collection of small, reusable scripts for quick copy-pasting into your projects. Some parts were created with AI. Licensed under CC-BY-SA-4.0: you can use, share, and adapt them with proper attribution, and any modifications must be shared under the same license.

## VanillaJS-FloatingWindow
[VanillaJS-FloatingWindow](VanillaJS-FloatingWindow/)

This code is designed to create interactive, movable, and resizable "windows" on a webpage, much like the windows you use on a computer desktop. Each window includes a title bar with controls to minimize, maximize, or close it, along with a space to display custom content. You can drag the windows around the screen by clicking and holding the title bar, and resize them by dragging the bottom-right corner. The minimize button shrinks the window and moves it to the top of the screen, while the maximize button makes it fill the entire screen. The close button removes the window, but only if a condition allows it.

The system is designed to handle multiple windows at the same time, ensuring the one you interact with comes to the front. It saves certain settings, such as whether a window is minimized, so they can be restored the next time the page is loaded. The windows have a modern design with shadows and color styling, making them visually appealing and user-friendly. They can be used for various tasks, like displaying information or interacting with elements on the page, and work together without overlapping issues. This code essentially transforms a webpage into a dynamic, desktop-like environment where users can organize and interact with content efficiently.


[example code with one window](VanillaJS-FloatingWindow/ExampleWindowUseage.html)
 
[example code with two windows](VanillaJS-FloatingWindow/ExampleTwoWindows.html)


![Video Preview](assetsForGit/VanillaJS-FloatingWindow.gif)

https://raw.githubusercontent.com/grayoctagon/CopyPasteScripts/refs/heads/main/assetsForGit/VanillaJS-FloatingWindow.mp4


## CryptoCrafter (Hybrid Encryption Scripts)
[CryptoCrafter](CryptoCrafter/)

This repository contains two PowerShell scripts for secure file encryption and decryption using a hybrid encryption method that combines RSA and AES.

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


