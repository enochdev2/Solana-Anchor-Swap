/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/todo_solana.json`.
 */
export type TodoSolana = {
  address: "3Dz8ofmvtfGHZhEXdqQSNftNbpnXJcUwrK231aamwDiD";
  metadata: {
    name: "todoSolana";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "addTodo";
      discriminator: [188, 16, 45, 145, 4, 5, 188, 75];
      accounts: [
        {
          name: "signer";
          writable: true;
          signer: true;
        },
        {
          name: "todoAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [84, 79, 68, 79, 95, 65, 67, 67];
              },
              {
                kind: "account";
                path: "signer";
              }
            ];
          };
        }
      ];
      args: [
        {
          name: "description";
          type: "string";
        }
      ];
    },
    {
      name: "initializePda";
      discriminator: [178, 254, 136, 212, 127, 85, 171, 210];
      accounts: [
        {
          name: "signer";
          writable: true;
          signer: true;
        },
        {
          name: "todoAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [84, 79, 68, 79, 95, 65, 67, 67];
              },
              {
                kind: "account";
                path: "signer";
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    },
    {
      name: "updateTodo";
      discriminator: [105, 8, 31, 183, 159, 73, 203, 134];
      accounts: [
        {
          name: "signer";
          writable: true;
          signer: true;
        },
        {
          name: "todoAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [84, 79, 68, 79, 95, 65, 67, 67];
              },
              {
                kind: "account";
                path: "signer";
              }
            ];
          };
        }
      ];
      args: [
        {
          name: "index";
          type: "u8";
        },
        {
          name: "isCompleted";
          type: "bool";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "todoState";
      discriminator: [232, 39, 87, 92, 45, 186, 14, 13];
    }
  ];
  types: [
    {
      name: "todo";
      type: {
        kind: "struct";
        fields: [
          {
            name: "description";
            type: "string";
          },
          {
            name: "isCompleted";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "todoState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "key";
            type: "pubkey";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "todos";
            type: {
              vec: {
                defined: {
                  name: "todo";
                };
              };
            };
          },
          {
            name: "totalTodos";
            type: "u64";
          }
        ];
      };
    }
  ];
};
