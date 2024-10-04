"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program } from "../../anchor/setup";

export default function AddTodo() {
  const [input, setInput] = useState<string>("");
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const addTodo = async () => { 
    if (!input) return alert("Please fill in the text");
    if (!connection ||!publicKey ||!program) return alert("Please connect your wallet");

    try {
      if (!connection) return;

      if (input.trim().length == 0) {
        return;
      }
      const tx = await program.methods
        .addTodo(input)
        .accounts({
          signer: publicKey!,
        })
        .transaction();
      const sign = await sendTransaction(tx, connection);
      console.log("sign after adding", sign);
    } catch (error) {
      console.log("something went wront while adding todo", error);
    }
  };

  return (
    <div className=" flex p-5 my-8 mb-4 gap-2 bg-black/40 rounded-xl" >
      <Input
        type="text"
        placeholder="Add a new todo..."
        className="flex-1 rounded-md border border-input bg-transparent px-3 py-6 text-base shadow-sm transition-colors"
        onChange={(e: any) => setInput(e.target.value)}
      />
      <Button
        type="submit"
        className="inline-flex h-14 items-center justify-center rounded-md bg-gradient-to-bl from-[#05415f] to-[#082e08] w-[30%] px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        onClick={addTodo}
      >
        Add Todo
      </Button>
    </div>
  );
}
