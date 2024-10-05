import bs58 from 'bs58'; // You might need to install this if the key is base58 encoded
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, Connection, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getKeypairFromFile } from "@solana-developers/helpers";
// import { Token, TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from "@solana/spl-token";
import { getAccount, getAccountLen, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { assert } from "chai";
import { expect } from "chai";

import { 
  // Token, 
  TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Hackaton } from "../target/types/hackaton";
import { BN } from "bn.js";


describe("usdt_sol_swap", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.Hackaton as Program<Hackaton>;

  // Define accounts needed for the tests
  let admin: anchor.web3.Keypair;
  let users: anchor.web3.Keypair;
  let userSolAccount: anchor.web3.Keypair;
  let userUsdtAccount: anchor.web3.Keypair;
  let programUsdtVault: PublicKey;
  let programUsdtAssocatedAccount: PublicKey;
  let programSolVault: anchor.web3.PublicKey;
  let oraclePriceFeed: anchor.web3.PublicKey; // Set this to the actual oracle price feed address
  let privateKeyHex: any;
  let userKeypair: any;
  let privateKeyUint8Array : any;
  let admins = anchor.web3.Keypair;
  let adminKeypair : anchor.web3.Keypair;
  let icoMint: PublicKey;
  let icoAtaForAdmin: PublicKey;
  let icoAtaForIcoProgram: PublicKey;
  let userAta: PublicKey;
  let dataAccount: PublicKey;
  let adminPrivateKey : any;
  let adminPublicKey : any;
  
  
  const SOL_USDC_FEED = new PublicKey("EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw");
  const CUSTOM_USDT_MINT = new PublicKey("8rRGXfEfawfkzdTg9QVJpDuKBhBF1Ab3gzRt3tMsTSTK");

  before(async () => {
    // Initialize the accounts and mint tokens as needed
    admin = anchor.web3.Keypair.generate();
    users = anchor.web3.Keypair.generate();
    // admin = user;
    userSolAccount = anchor.web3.Keypair.generate();
    userUsdtAccount = anchor.web3.Keypair.generate();
    // programUsdtVault = anchor.web3.Keypair.generate();
    // programUsdtVault = new anchor.web3.PublicKey("2MjB1se3u6Vvn6uwjJaCvmpiZFcM8feeiZRYDGKPU9JC"); // Example price feed
    programUsdtVault = new anchor.web3.PublicKey("FpBwH9XTC3K4Z1asaTFhC9nqVDQhjFAvzTaXfaH4eJDV"); // Associated token account address for USDT
    console.log("🚀 ~ before ~ programUsdtVault:", programUsdtVault)
    programSolVault = new anchor.web3.PublicKey("AJxJbLuKuXp9uTgKfmxtntRexXRcQwKRis9q8w3tWGKp");
    console.log("🚀 ~ before ~ programSolVault:", programSolVault)
    // Token-Program-ID          8kGhgEqhgtEDJwnBpPUUFX8BV3d8GrLZ6jfHkEwGeRmW
    // usdt-vault 2MjB1se3u6Vvn6uwjJaCvmpiZFcM8feeiZRYDGKPU9JC
    // sol-vault AJxJbLuKuXp9uTgKfmxtntRexXRcQwKRis9q8w3tWGKp
    
    // programUsdtAssocatedAccount = new anchor.web3.PublicKey("DcX2E3vHJRkoHxCorh8MBU2tiAuTSiqNdQt6YWCav21r"); // Example price feed
    // // Airdrop SOL to the user account for testing
    // await anchor.getProvider().sendAndConfirm(
    //     SystemProgram.transfer({
    //         fromPubkey:,
    //         toPubkey: ,
    //         lamports: , // Adjust as necessary
    //     }),
    //     [user]
    // );
    // adminPublicKey = 'AXpiGXaNqNgjRGKgYExZk9Ye3xo2EwVABhMFzcQGbCvf';
    
    
    // Example: assuming your private key is in base58 format, as Solana keys often are
    const adminPrivateKeyBase58 = '4aVKNvEk57BQtqtjuWwSJctF3MhKCCzBLbYez7ynj9VAJ5xj9PBPRVd9USF4xFDa9eoVR5Qr1818NsESGzrn72wM';
// 4aVKNvEk57BQtqtjuWwSJctF3MhKCCzBLbYez7ynj9VAJ5xj9PBPRVd9USF4xFDa9eoVR5Qr1818NsESGzrn72wM
const adminPrivateKeyBytess = bs58.decode(adminPrivateKeyBase58);

// Check the length of the decoded key
console.log("Secret key length:", adminPrivateKeyBytess.length); // Should be 64 bytes

if (adminPrivateKeyBytess.length === 64) {
  adminKeypair = Keypair.fromSecretKey(adminPrivateKeyBytess);
  console.log('Admin Public Key:', adminKeypair.publicKey.toString());
} else {
  console.error("Error: Invalid secret key length. Expected 64 bytes.");
}

// const adminPublicKey = admin.publicKey;
const mint = new PublicKey("8rRGXfEfawfkzdTg9QVJpDuKBhBF1Ab3gzRt3tMsTSTK");;
adminPublicKey = new PublicKey('AXpiGXaNqNgjRGKgYExZk9Ye3xo2EwVABhMFzcQGbCvf');

icoAtaForAdmin =  anchor.utils.token.associatedAddress({
  mint: mint,
  owner: adminPublicKey
});
    
console.log("🚀 ~ before ~ icoAtaForAdmin:", icoAtaForAdmin)

adminPrivateKey = '4aVKNvEk57BQtqtjuWwSJctF3MhKCCzBLbYez7ynj9VAJ5xj9PBPRVd9USF4xFDa9eoVR5Qr1818NsESGzrn72wM';
// 4aVKNvEk57BQtqtjuWwSJctF3MhKCCzBLbYez7ynj9VAJ5xj9PBPRVd9USF4xFDa9eoVR5Qr1818NsESGzrn72wM
    // Initialize the program's vaults, etc.
    // Private key in hex format
    privateKeyHex = '2b2d245c5a8a19dc1ed4b05460a2a60cf55855a216c2a994af0955502469b1f3c859e0a19144ab3e6850f43b1faacb84060f9d01b2ec463b0d36f96746d13af1';
    // Convert the base64 encoded string to a buffer
    const adminPrivateKeyBytes = Uint8Array.from(
      Buffer.from(adminPrivateKey, 'base64')
    );
    // Convert the private key from hex to Uint8Array
    // privateKeyUint8Array = Uint8Array.from(Buffer.from(privateKeyHex, 'hex'));

    // Step 2: Create a Keypair from the private key bytes
    //  adminKeypair = Keypair.fromSecretKey(adminPrivateKeyBytes);
    //  adminKeypair = Keypair.fromSecretKey(adminPrivateKeyBytes);
    
    // Create a Keypair from the private key
    // userKeypair = Keypair.fromSecretKey(privateKeyUint8Array);
    // Add your initialization logic for the program's USDT and SOL vaults here

    oraclePriceFeed = new anchor.web3.PublicKey("EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw"); // Example price feed

      // Derive program's ATA and data account addresses using the seeds
      const [icoAtaForIcoProgram, _bump] = PublicKey.findProgramAddressSync(
        [CUSTOM_USDT_MINT.toBuffer()],
        program.programId
      );
  
      const [dataAccount, _dataBump] =  PublicKey.findProgramAddressSync(
        [Buffer.from("data"), admin.publicKey.toBuffer()],
        program.programId
      );
});

it("Initialize ICO ATA", async () => {
  await program.methods
    .createIcoAta()
    .accounts({
      //@ts-ignore
      icoAtaForIcoProgram,
      data: dataAccount,
      icoMint,
      icoAtaForAdmin,
      admin: adminPublicKey,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .signers([adminKeypair])
    .rpc();

  const data = await program.account.data.fetch(dataAccount);
  console.log("🚀 ~ it ~ data:", data)
  // expect(data.admin.toString()).to.equal(admin.toString());
});

// it("Buy ICO tokens with SOL", async () => {
//       const solAmount = new anchor.BN(1); // 1 SOL
//       const [] = PublicKey.findProgramAddressSync([icoMint.toBuffer()], program.programId);
//       let [pda, bump] = PublicKey.findProgramAddressSync(
//               [icoMint.toBuffer()],
//               program.programId
//             );
  
//       await program.methods
//         .buyWithSol(bump, solAmount)
//         .accounts({
//           //@ts-ignore
//           icoAtaForIcoProgram,
//           data: dataAccount,
//           icoMint,
//           icoAtaForUser: userAta,
//           user: users.publicKey,
//           admin: admin.publicKey,
//           oraclePriceFeed: SOL_USDC_FEED,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           systemProgram: SystemProgram.programId,
//         })
//         .signers([users])
//         .rpc();
  
//       // const userAtaInfo = await Token.getAccountInfo(provider.connection, userAta);
//       // expect(userAtaInfo.amount.toNumber()).to.be.gt(0); // User should have received ICO tokens
//     });

    // it("Should successfully buy ICO with USDT", async () => {
    //   // Expected ICO amount based on oracle price (e.g. 100 USDT -> X ICO tokens)
    //   const usdtAmount = new BN(1); // 10 USDT
    //   const expectedIcoAmount = new BN(0); // Hypothetical 500 ICO tokens for 10 USDT
  
    //   // Call the buy_with_usdt function
    //   await program.methods
    //     .buyWithUsdt(1, usdtAmount)
    //     .accounts({
    //       icoAtaForIcoProgram: icoAtaForProgram,
    //       icoAtaForUser: userUsdtAta.address,
    //       icoMint,
    //       user: users.publicKey,
    //       admin: admin.publicKey,
    //       tokenProgram: TOKEN_PROGRAM_ID,
    //       oraclePriceFeed: oraclePriceFeed,
    //       systemProgram: anchor.web3.SystemProgram.programId,
    //     })
    //     .signers([users])
    //     .rpc();
  
    //   // Fetch the ICO token account for the user and verify the transfer
    //   // const icoAccount = getAccountLen(provider.connection, icoAtaForProgram);
    //   // assert.equal(Number(icoAccount), Number(expectedIcoAmount));
  
    //   // // Verify SOL transfer logic (admin balance should decrease)
    //   // const adminBalance = await provider.connection.getBalance(admin.publicKey);
    //   // const userBalance = await provider.connection.getBalance(user.publicKey);
  
    //   assert.isTrue(adminBalance < 2 * anchor.web3.LAMPORTS_PER_SOL);
    //   assert.isTrue(userBalance > 0);
    // });

// it("buys SOL with USDT", async () => {
//   const usdtAmount = 10; // Adjust as necessary

//   const tx = await program.methods
//   .buySolWithUsdc(new anchor.BN(usdtAmount))
//   .accounts({
//     user: user.publicKey,
//     userUsdtAccount: userUsdtAccount.publicKey,
//     userSolAccount: userSolAccount.publicKey,
//     programUsdtVault: programUsdtVault,
//     programSolVault: programSolVault,
//           // @ts-ignore
//     oraclePriceFeed: oraclePriceFeed,
//     // programSigner: payer.publicKey,
//     tokenProgram: TOKEN_PROGRAM_ID,
//     systemProgram: SystemProgram.programId,   // Use the connected wallet as the signer
//   })
//   .signers([])
//   .rpc()


//   // Add assertions to check balances, etc.
//    // Example: Check that the user's SOL account received SOL
// });

// it("sells SOL for USDT", async () => {
//   const solAmount = 1; // Adjust as necessary

//   await program.methods.sellSolForUsdt(new anchor.BN(solAmount))
//       .accounts({
//           user: user.publicKey,
//           userUsdtAccount: userUsdtAccount.publicKey,
//           userSolAccount: userSolAccount.publicKey,
//           programUsdtVault: programUsdtVault,
//           programSolVault: programSolVault,
//           // @ts-ignore
//           oraclePriceFeed: oraclePriceFeed,
//           programSigner: payer.publicKey,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           systemProgram: SystemProgram.programId,
//       })
//       .signers([user, userKeypair])
//       .rpc()

//       // Add assertions to check balances, etc.
//       // Example: Check that the user's USDT account received USDT
//     });
});





// describe("hackaton", () => {
//   const provider = anchor.AnchorProvider.env();
//   anchor.setProvider(provider);

//   const program = anchor.workspace.Hackaton as Program<Hackaton>;

//   let icoMint: PublicKey;
//   let icoAtaForAdmin: PublicKey;
//   let icoAtaForIcoProgram: PublicKey;
//   let userAta: PublicKey;
//   let dataAccount: PublicKey;
//   let admin = provider.wallet.publicKey;
  
//   const SOL_USDC_FEED = new PublicKey("EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw");
//   const CUSTOM_USDT_MINT = new PublicKey("8rRGXfEfawfkzdTg9QVJpDuKBhBF1Ab3gzRt3tMsTSTK");

//   before(async () => {
//     // Create the ICO mint
//     icoMint = await createMint(
//       provider.connection,
//       provider.wallet.payer,
//       admin,
//       null,
//       6, // Decimals
//       TOKEN_PROGRAM_ID
//     );

//     // Create admin's ATA for ICO tokens
//     icoAtaForAdmin = await createAccount(
//       provider.connection,
//       provider.wallet.payer,
//       icoMint,
//       admin,
//       TOKEN_PROGRAM_ID
//     );

//     // Create user's ATA for ICO tokens
//     const user = anchor.web3.Keypair.generate();
//     userAta = await createAccount(
//       provider.connection,
//       provider.wallet.payer,
//       icoMint,
//       user.publicKey,
//       TOKEN_PROGRAM_ID
//     );

//     // Mint some ICO tokens to admin's ATA for testing
//     await mintTo(
//       provider.connection,
//       provider.wallet.payer,
//       icoMint,
//       icoAtaForAdmin,
//       admin,
//       100_000_000, // Mint 100 ICO tokens
//       []
//     );

  
//   });

//   it("Initialize ICO ATA", async () => {
//     await program.methods
//       .createIcoAta()
//       .accounts({
//         icoAtaForIcoProgram,
//         data: dataAccount,
//         icoMint,
//         icoAtaForAdmin,
//         admin,
//         systemProgram: SystemProgram.programId,
//         tokenProgram: TOKEN_PROGRAM_ID,
//         rent: anchor.web3.SYSVAR_RENT_PUBKEY,
//       })
//       .rpc();

//     const data = await program.account.data.fetch(dataAccount);
//     expect(data.admin.toString()).to.equal(admin.toString());
//   });

//   it("Buy ICO tokens with SOL", async () => {
//     const solAmount = new anchor.BN(1_000_000_000); // 1 SOL
//     const icoAtaBump = (await PublicKey.findProgramAddress([icoMint.toBuffer()], program.programId))[1];

//     await program.methods
//       .buyWithSol(icoAtaBump, solAmount)
//       .accounts({
//         icoAtaForIcoProgram,
//         data: dataAccount,
//         icoMint,
//         icoAtaForUser: userAta,
//         user: provider.wallet.publicKey,
//         admin,
//         oraclePriceFeed: SOL_USDC_FEED,
//         tokenProgram: TOKEN_PROGRAM_ID,
//         systemProgram: SystemProgram.programId,
//       })
//       .rpc();

//     const userAtaInfo = await Token.getAccountInfo(provider.connection, userAta);
//     expect(userAtaInfo.amount.toNumber()).to.be.gt(0); // User should have received ICO tokens
//   });

//   it("Buy ICO tokens with USDT", async () => {

//     let [pda, bump] = PublicKey.findProgramAddressSync(
//       [Buffer.from("TODO_ACC"), provider.publicKey.toBuffer()],
//       program.programId
//     );
//     const usdtAmount = new anchor.BN(10_000_000); // 10 USDT
//     const icoAtaBump = (PublicKey.findProgramAddressSync([icoMint.toBuffer()], program.programId))[1];

//     await program.methods
//       .buyWithUsdt(icoAtaBump, usdtAmount)
//       .accounts({
//         icoAtaForIcoProgram,
//         data: dataAccount,
//         icoMint,
//         icoAtaForUser: userAta,
//         user: provider.wallet.publicKey,
//         admin,
//         oraclePriceFeed: SOL_USDC_FEED,
//         tokenProgram: TOKEN_PROGRAM_ID,
//         systemProgram: SystemProgram.programId,
//       })
//       .rpc();

//     const userAtaInfo = await Token.getAccountInfo(provider.connection, userAta);
//     expect(userAtaInfo.amount.toNumber()).to.be.gt(0); // User should have received ICO tokens
//   });
// });
