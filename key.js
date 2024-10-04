const { Keypair } = require('@solana/web3.js');
const { PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddressSync } = require('@solana/spl-token');
const  anchor = require("@coral-xyz/anchor");

// Generate a new keypair
// const keypair = Keypair.generate();
let mintKeypair = new anchor.web3.PublicKey("EFWnx4qUq8DGuKsrDzcGTfC9EScX3DKrsJ7v8nqVGzR2")
programUsdtVault = new anchor.web3.PublicKey("EV62byYdsPq9W7nR8TL2JtX5EVDrLwWmXYuMjttahbdJ");
// Get the private key as a Uint8Array
// const privateKey = keypair.secretKey;

// Convert the private key to a human-readable format (base64 or hex)
// const privateKeyHex = Buffer.from(privateKey).toString('hex');

// console.log("Public Key:", keypair.publicKey.toBase58());
// console.log("Private Key (Hex):", privateKeyHex);

{ /*
    Public Key: EV62byYdsPq9W7nR8TL2JtX5EVDrLwWmXYuMjttahbdJ
    Private Key (Hex): 2b2d245c5a8a19dc1ed4b05460a2a60cf55855a216c2a994af0955502469b1f3c859e0a19144ab3e6850f43b1faacb84060f9d01b2ec463b0d36f96746d13af1
    */}
    
    const usdtVaultTokenAccountAddress = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        programUsdtVault
    );
    console.log("Private Key (Hex):", usdtVaultTokenAccountAddress);



// const keypairData = {
//   publicKey: keypair.publicKey.toBase58(),
//   privateKey: Array.from(keypair.secretKey),
// };

// // Save the keypair data to a JSON file
// fs.writeFileSync('new_keypair.json', JSON.stringify(keypairData, null, 2));

// console.log('Keypair saved to new_keypair.json');
