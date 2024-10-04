"use client";
import React, { useEffect, useState } from "react";
import { getPda, program, todoState, ProgramID } from "../../anchor/setup";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js"
import Typewriter from "typewriter-effect";

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/ZdbOm04JKIy
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function Todo() {
  const router = useRouter()
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [pda, setPda] = useState<null | string>(null);
  const [todos, setTodos] = useState<any>([]);


  const fetchData = async () => {
    
    try {
      if (connection && publicKey && program) {
        const { pdaAddress, bump } = getPda(publicKey);
        setPda(pdaAddress.toString());
        const data = await program.account.todoState.fetch(pdaAddress);
        console.log("data is", data);
        setTodos(data.todos);
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
  
  const updateTodo = async (index: number, is_completed:boolean) => {

    if (!connection ||!publicKey ||!program) return alert("Please connect your wallet");

    try {
      if (connection && publicKey && program) {
        const { pdaAddress, bump } = getPda(publicKey);
        setPda(pdaAddress.toString());

        const tx = await program.methods
        .updateTodo(index, !is_completed)
        .accounts({
          signer: publicKey!,
        })
        .transaction();
      const sign = await sendTransaction(tx, connection);
      console.log("sign after adding", sign);

      router.refresh();
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

  }


  // const todos: {
  //   description: string;
  //   isCompleted: boolean;
  // }[] = [];

  return (
    <Card className="text-white bg-transparent bg-gradient-to-tr from-[] to-[] border-none my-8  ">
      <CardHeader className="text-3xl rounded-lg font-extrabold bg-black/30 ">
        <CardTitle className="">Todos</CardTitle>
        <CardDescription className="text-2xl font-bold flex text-white">
          Manage your {" "} 
        <span className="cursor-pointer text-cyan-300 ml-3">
                    <Typewriter
                      options={{
                        strings: "tasks and track your progress",
                        autoStart: true,
                        loop: true,
                      }}
                    />
                  </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="text-2xl text-emerald-900 font-extrabold">
            <TableRow>
              <TableHead className="text-2xl text-indigo-600 font-extrabold">Description</TableHead>
              <TableHead className="text-2xl text-indigo-600 font-extrabold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="border-0 ">
            {todos.map((todo:any , index:any) => (
             
                
              <TableRow className="border-none text-xl" key={index}>
                <TableCell className=" border-black/50 border-b-8 bg-black/30 my-3">{todo.description}</TableCell>
                <TableCell className="bg-black/30  border-black/50 border-b-8 block md:flex justify-between gap-3">
                  <Button onClick={() => updateTodo(index, todo.isCompleted)}>
                  <Badge variant="secondary">{todo.isCompleted}</Badge>
                  </Button>
                  <p className=" bg-black/30 rounded-full py-2 px-3">
                  {todo.isCompleted ? "Completed" : "Not completed"}
                  </p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
