<#
	Author: Michael Beck
	Version: 2025-01-28
	Date: 2025-01-28
	License: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
	License URL: https://creativecommons.org/licenses/by-sa/4.0/
	Repository: https://github.com/grayoctagon/CopyPasteScripts

	You are free to:
	- Share: Copy and redistribute the material in any medium or format.
	- Adapt: Remix, transform, and build upon the material for any purpose, even commercially.

	Under the following terms:
	- Attribution: You must give appropriate credit, provide a link to the license, and indicate if changes were made.
	- ShareAlike: If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

	Disclaimer:
	This work is provided "as is" without any warranties or guarantees of any kind.

	Description: 
	This project consists of two PowerShell scripts for encrypting and decrypting files using hybrid encryption with RSA and AES:

	Encryption Script:
		Generates an RSA key pair (public/private keys) and saves them in PEM format.
		Encrypts files larger than 100kB in a specified directory and its subdirectories.
		Uses AES for file encryption, with the AES key and IV encrypted by RSA.
		Saves the encrypted files (*.enc) along with their RSA-encrypted keys (*.key) and IVs (*.iv).
	Decryption Script:
		Loads the RSA private key to decrypt the AES keys and IVs.
		Decrypts the encrypted files using the restored AES keys and IVs.
		Restores the files to their original format and filename.
		These scripts provide a secure and efficient method for encrypting and decrypting large files using hybrid encryption.
#>
$self = $PSScriptRoot;
echo "running in: $self";

# Pfade für die Schlüsseldateien definieren
$PrivateKeyPath = "$self/private.key"

# RSA-Objekt erstellen und privaten Schlüssel laden
$RSA = New-Object System.Security.Cryptography.RSACryptoServiceProvider(2048)
$PrivateKeyPEM = [System.IO.File]::ReadAllText($PrivateKeyPath)
$PrivateKeyPEM = $($PrivateKeyPEM -replace '-----.*-----|\s','')
$PrivateKeyBytes = [Convert]::FromBase64String($PrivateKeyPEM)
$RSA.ImportCspBlob($PrivateKeyBytes)

# Funktion zur AES-Entschlüsselung
function Decrypt-WithAES {
	param (
		[byte[]]$Data,
		[byte[]]$Key,
		[byte[]]$IV
	)
	$AES = [System.Security.Cryptography.Aes]::Create()
	$AES.Key = $Key
	$AES.IV = $IV

	$Decryptor = $AES.CreateDecryptor()
	$DecryptedData = $Decryptor.TransformFinalBlock($Data, 0, $Data.Length)
	$AES.Dispose()
	return $DecryptedData
}

# Verzeichnis "$DirectoryPath" definieren
$DirectoryPath = "$self/encryptme"

# Überprüfen, ob das Verzeichnis existiert
if (-Not (Test-Path $DirectoryPath)) {
	Write-Host "Verzeichnis '$DirectoryPath' nicht gefunden."
	exit
}

# Verschlüsselte Dateien finden
$EncryptedFiles = Get-ChildItem -Path $DirectoryPath -Recurse -File -Filter "*.enc"

# Jede verschlüsselte Datei entschlüsseln
foreach ($EncryptedFile in $EncryptedFiles) {
	# Verschlüsselte Datei und Schlüssel/IV laden
	$EncryptedContent = [System.IO.File]::ReadAllBytes($EncryptedFile.FullName)
	$EncryptedKey = [System.IO.File]::ReadAllBytes("$($EncryptedFile.FullName).key")
	$EncryptedIV = [System.IO.File]::ReadAllBytes("$($EncryptedFile.FullName).iv")

	# Schlüssel und IV mit RSA entschlüsseln
	$AESKey = $RSA.Decrypt($EncryptedKey, $true)
	$AESIV = $RSA.Decrypt($EncryptedIV, $true)

	# Datei mit AES entschlüsseln
	$DecryptedContent = Decrypt-WithAES -Data $EncryptedContent -Key $AESKey -IV $AESIV

	# Entschlüsselte Datei speichern (Originalname wiederherstellen)
	$OriginalFilePath = $EncryptedFile.FullName -replace "\.enc$", ""
	[System.IO.File]::WriteAllBytes($OriginalFilePath, $DecryptedContent)

	Write-Host "Datei entschlüsselt: $($EncryptedFile.FullName) -> $OriginalFilePath"
}

Write-Host "Entschlüsselung abgeschlossen."
