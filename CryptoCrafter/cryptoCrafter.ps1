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

# Hilfsfunktion zum Konvertieren in PEM-Format
function ConvertTo-PEM {
	param (
		[byte[]]$Bytes,
		[string]$Header
	)
	$Base64 = [Convert]::ToBase64String($Bytes, 'InsertLineBreaks')
	return "-----BEGIN $Header-----`n$Base64`n-----END $Header-----"
}

# Pfade für die Schlüsseldateien definieren
$PrivateKeyPath = "$self/private.key"
$PublicKeyPath = "$self/public.key"

# Schlüsselpaar generieren
$RSA = New-Object System.Security.Cryptography.RSACryptoServiceProvider(2048)

# Private und Public Key im PEM-Format exportieren
$PrivateKeyPEM = ConvertTo-PEM -Bytes $RSA.ExportCspBlob($true) -Header "RSA PRIVATE KEY"
$PublicKeyPEM = ConvertTo-PEM -Bytes $RSA.ExportCspBlob($false) -Header "PUBLIC KEY"

# Private und Public Key in Dateien speichern
[System.IO.File]::WriteAllText($PrivateKeyPath, $PrivateKeyPEM)
[System.IO.File]::WriteAllText($PublicKeyPath, $PublicKeyPEM)

Write-Host "Schlüsselpaar wurde erstellt und im PEM-Format gespeichert."

# Öffentlichen Schlüssel aus der Datei lesen
$PublicKeyFromFile = [System.IO.File]::ReadAllText($PublicKeyPath)
$PublicKeyFromFile = $($PublicKeyFromFile -replace '-----.*-----|\s','')
$PublicKeyBytes = [Convert]::FromBase64String($PublicKeyFromFile)
$RSA.ImportCspBlob($PublicKeyBytes)

# Funktion zur AES-Verschlüsselung
function Encrypt-WithAES {
	param (
		[byte[]]$Data,
		[ref]$Key,
		[ref]$IV
	)
	$AES = [System.Security.Cryptography.Aes]::Create()
	$AES.KeySize = 256
	$AES.GenerateKey()
	$AES.GenerateIV()

	$Key.Value = $AES.Key
	$IV.Value = $AES.IV

	$Encryptor = $AES.CreateEncryptor()
	$EncryptedData = $Encryptor.TransformFinalBlock($Data, 0, $Data.Length)
	$AES.Dispose()
	return $EncryptedData
}

# Verzeichnis "$DirectoryPath" definieren
$DirectoryPath = "$self/encryptme"

# Überprüfen, ob das Verzeichnis existiert
if (-Not (Test-Path $DirectoryPath)) {
	Write-Host "Verzeichnis '$DirectoryPath' nicht gefunden."
	exit
}

# Dateien im Verzeichnis "$DirectoryPath" und Unterverzeichnisse durchsuchen
$FilesToEncrypt = Get-ChildItem -Path $DirectoryPath -Recurse -File | Where-Object { $_.Length -gt 100KB }

# Jede Datei verschlüsseln
foreach ($File in $FilesToEncrypt) {
	# Originaldatei einlesen
	$FileContent = [System.IO.File]::ReadAllBytes($File.FullName)

	# AES-Schlüssel und IV generieren und Datei verschlüsseln
	$AESKey = $null
	$AESIV = $null
	$EncryptedContent = Encrypt-WithAES -Data $FileContent -Key ([ref]$AESKey) -IV ([ref]$AESIV)

	# AES-Schlüssel und IV mit RSA verschlüsseln
	$EncryptedKey = $RSA.Encrypt($AESKey, $true)
	$EncryptedIV = $RSA.Encrypt($AESIV, $true)

	# Verschlüsselte Daten speichern
	$EncryptedFilePath = "$($File.FullName).enc"
	[System.IO.File]::WriteAllBytes($EncryptedFilePath, $EncryptedContent)

	# Schlüssel und IV speichern
	[System.IO.File]::WriteAllBytes("$EncryptedFilePath.key", $EncryptedKey)
	[System.IO.File]::WriteAllBytes("$EncryptedFilePath.iv", $EncryptedIV)

	Write-Host "Datei verschlüsselt: $($File.FullName) -> $EncryptedFilePath"
}

Write-Host "Verschlüsselung abgeschlossen."
