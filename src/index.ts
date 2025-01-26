import { send } from "./lib/jwtClient";

import request from "./request.json";
import genesis from "./state/genesis.json";

import "dotenv/config";
import { buildStateTrieRoot } from "./state/trie";
import { hexToBytes, bytesToHex } from "@ethereumjs/util";
import { Wallet } from "@ethereumjs/wallet";
import { LegacyTransaction } from "@ethereumjs/tx";

const secret = process.env.JWT_SECRET || "";

const main = async () => {
  //   const response = await send(request, secret);
  //   console.log(response);

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

  //   console.log(signedTx);

  console.log(await buildStateTrieRoot(genesis.alloc));

  genesis.alloc = {
    "0x0000000000000000000000000000000000000000": {
      balance: "0x5208",
    },
    "0x000000000000000000000000000000000000000a": {
      balance: "0x1",
    },
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266": {
      balance: "0xef037",
      nonce: "0x1",
    },
  };

  console.log(
    bytesToHex(await buildStateTrieRoot(genesis.alloc)) ==
      "0xd077ec67768e27815486177abdd398fc21673526f18dd039f12ebdf3b8420e36"
  );
};

main();
