import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { IdlAccounts, Program } from "@coral-xyz/anchor";
import type { TodoSolana } from "./idlType";
import idl from "./idl.json";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const ProgramID = new PublicKey(
  "3Dz8ofmvtfGHZhEXdqQSNftNbpnXJcUwrK231aamwDiD"
);

export const program = new Program(idl as TodoSolana, {
  connection,
});

export const getPda = (address: PublicKey) => {
  const [pdaAddress, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("TODO_ACC"), address.toBuffer()],
    program.programId
  );

  return {
    pdaAddress,
    bump,
  };
};

export type todoState = IdlAccounts<TodoSolana>["todoState"];
