"use client";
import React, { useEffect, useState } from "react";
import { getPda, program, todoState, ProgramID } from "../../anchor/setup";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import Typewriter from "typewriter-effect";


function TodosCount() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [pda, setPda] = useState<null | string>(null);
  const [count, setCount] = useState<null | number>(null);
  const fetchData = async () => {
    try {
      if (connection && publicKey && program) {
        const { pdaAddress, bump } = getPda(publicKey);
        setPda(pdaAddress.toString());
        const data = await program.account.todoState.fetch(pdaAddress);
        console.log("data is", data);
        setCount(data.totalTodos.toNumber());
      }
    } catch (error: any) {
      if (error.message.includes("Account does not exist or has no data")) {
        const transaction = await program.methods
          .initializePda()
          .accounts({
            signer: publicKey!,
          })
          .transaction();
        const transactionSignature = await sendTransaction(
          transaction,
          connection
        );

        console.log("3", transactionSignature);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [connection, publicKey, program]);

  return (
    <div className="flex flex-col bg-black/30 p-3 rounded-xl text-lg">
      <p className="font-bold">the count is {''} {''} <span className="text-xl">{count}</span></p>
       <p className=""> Adrress: {" "} {" "} {pda?.slice(0, 5)}... {pda?.slice(35)}</p>
       <span className="cursor-pointer text-purple-600 ml-3 text-end font-bold">
                    <Typewriter
                      options={{
                        strings: "@defi_prince",
                        autoStart: true,
                        loop: true,
                      }}
                    />
                  </span>
    </div>
  );
}

export default TodosCount;
