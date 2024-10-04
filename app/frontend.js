import { Connection, PublicKey } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import { getOrCreateAssociatedTokenAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const connection = new Connection("https://api.devnet.solana.com", "processed");
const provider = new Provider(connection, wallet, { commitment: "processed" });

const programID = new PublicKey("YourProgramIDHere");
const program = new Program(idl, programID, provider);

const swapUsdtForSol = async (usdtAmount) => {
    const userUsdtAccount = await getOrCreateAssociatedTokenAccount(provider.connection, provider.wallet.publicKey, usdtMint, provider.wallet.publicKey);
    const userSolAccount = provider.wallet.publicKey;

    await program.rpc.swapUsdtForSol(new BN(usdtAmount), {
        accounts: {
            user: provider.wallet.publicKey,
            userUsdtAccount: userUsdtAccount.address,
            userSolAccount: userSolAccount,
            programUsdtVault: programUsdtVaultPublicKey, 
            programSolVault: programSolVaultPublicKey, 
            oraclePriceFeed: oraclePriceFeedPublicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: web3.SystemProgram.programId,
        }
    });
};
