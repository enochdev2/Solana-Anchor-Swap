import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, Connection, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getKeypairFromFile } from "@solana-developers/helpers";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { assert } from "chai";

import { 
  // Token, 
  TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Hackaton } from "../target/types/hackaton";


describe("usdt_sol_swap", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.Hackaton as Program<Hackaton>;

  // Define accounts needed for the tests
  let user: anchor.web3.Keypair;
  let userSolAccount: anchor.web3.Keypair;
  let userUsdtAccount: anchor.web3.Keypair;
  let programUsdtVault: PublicKey;
  let programUsdtAssocatedAccount: PublicKey;
  let programSolVault: anchor.web3.PublicKey;
  let oraclePriceFeed: anchor.web3.PublicKey; // Set this to the actual oracle price feed address
  let privateKeyHex: any;
  let userKeypair: any;
  let privateKeyUint8Array : any;

  before(async () => {
    // Initialize the accounts and mint tokens as needed
    user = anchor.web3.Keypair.generate();
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

    // Initialize the program's vaults, etc.
    // Private key in hex format
    privateKeyHex = '2b2d245c5a8a19dc1ed4b05460a2a60cf55855a216c2a994af0955502469b1f3c859e0a19144ab3e6850f43b1faacb84060f9d01b2ec463b0d36f96746d13af1';
    
    // Convert the private key from hex to Uint8Array
    privateKeyUint8Array = Uint8Array.from(Buffer.from(privateKeyHex, 'hex'));
    
    // Create a Keypair from the private key
    userKeypair = Keypair.fromSecretKey(privateKeyUint8Array);
    // Add your initialization logic for the program's USDT and SOL vaults here

    oraclePriceFeed = new anchor.web3.PublicKey("EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw"); // Example price feed
});





it("buys SOL with USDT", async () => {
  const usdtAmount = 10; // Adjust as necessary

  const tx = await program.methods
  .buySolWithUsdc(new anchor.BN(usdtAmount))
  .accounts({
    user: user.publicKey,
    userUsdtAccount: userUsdtAccount.publicKey,
    userSolAccount: userSolAccount.publicKey,
    programUsdtVault: programUsdtVault,
    programSolVault: programSolVault,
          // @ts-ignore
    oraclePriceFeed: oraclePriceFeed,
    // programSigner: payer.publicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,   // Use the connected wallet as the signer
  })
  .signers([user, userKeypair])
  .rpc()


  // Add assertions to check balances, etc.
   // Example: Check that the user's SOL account received SOL
});

it("sells SOL for USDT", async () => {
  const solAmount = 1; // Adjust as necessary

  await program.methods.sellSolForUsdt(new anchor.BN(solAmount))
      .accounts({
          user: user.publicKey,
          userUsdtAccount: userUsdtAccount.publicKey,
          userSolAccount: userSolAccount.publicKey,
          programUsdtVault: programUsdtVault,
          programSolVault: programSolVault,
          // @ts-ignore
          oraclePriceFeed: oraclePriceFeed,
          programSigner: payer.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
      })
      .signers([user, userKeypair])
      .rpc()

      // Add assertions to check balances, etc.
      // Example: Check that the user's USDT account received USDT
    });
});

