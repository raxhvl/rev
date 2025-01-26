import "dotenv/config";
import { buildStateTrieRoot } from "./vm/trie";
import { hexToBytes, bytesToHex } from "@ethereumjs/util";
import { Wallet } from "@ethereumjs/wallet";
import { LegacyTransaction } from "@ethereumjs/tx";
import { t8n } from "./vm/t8n";
import { promises as fs } from "fs";
import path from "path";
const secret = process.env.JWT_SECRET || "";

const main = async () => {
  if (!process.env.ACCOUNT_1_KEY) {
    throw new Error(
      "ACCOUNT_1_KEY is not defined in the environment variables"
    );
  }
  const account = new Wallet(hexToBytes(process.env.ACCOUNT_1_KEY));
  console.log(account.getAddressString());

  const tx = new LegacyTransaction({
    to: "0x000000000000000000000000000000000000000a",
    value: 1,
    gasPrice: 1,
    gasLimit: 21000,
  });

  const signedTx = tx.sign(account.getPrivateKey());

  console.log(signedTx.toJSON());

  const preState = {
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266": {
      balance: "0xF4240",
    },
  };

  const txs = [
    {
      type: "0x0",
      nonce: "0x0",
      gas: "0x5208",
      to: "0x000000000000000000000000000000000000000a",
      value: "0x1",
      input: "0x",
      v: "0x26",
      r: "0xe43abe00a909cc8c647023db119a80e303ef594bbf71462210a5629c0da493eb",
      s: "0x2cf2165b81a4bf3374debc82c97160fd2f69a46823fd71cbd10a0c9c98a5dfdd",
      gasPrice: "0x1",
    },
  ];

  await t8n(preState, txs);
};

main();
