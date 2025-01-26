import "dotenv/config";
import { buildStateTrieRoot } from "./vm/trie";
import { hexToBytes, bytesToHex, intToHex } from "@ethereumjs/util";
import { Wallet } from "@ethereumjs/wallet";
import { LegacyTransaction } from "@ethereumjs/tx";
import { formatSignedTx, t8n } from "./vm/t8n";
import assert from "assert";
import { send } from "./lib/jwtClient";

const secret = process.env.JWT_SECRET || "";

const main = async () => {
  if (!process.env.ACCOUNT_1_KEY) {
    throw new Error(
      "ACCOUNT_1_KEY is not defined in the environment variables"
    );
  }
  const account = new Wallet(hexToBytes(process.env.ACCOUNT_1_KEY));

  const tx = new LegacyTransaction({
    to: "0x000000000000000000000000000000000000000a",
    value: 1,
    gasPrice: 1,
    gasLimit: 21000,
  });

  const signedTx = tx.sign(account.getPrivateKey());

  const preState = {
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266": {
      balance: "0xF4240",
    },
  };

  const txs = [];
  txs.push(signedTx.toJSON());

  const { result, postState } = await t8n(preState, txs.map(formatSignedTx));

  // Assumption: The state root is correct
  assert(bytesToHex(await buildStateTrieRoot(postState)) == result.stateRoot);

  const payload = {
    jsonrpc: "2.0",
    method: "engine_newPayloadV1",
    params: [
      {
        parentHash:
          "0x9cbea0de83b440f4462c8280a4b0b4590cdb452069757e2c510cb3456b6c98cc",
        feeRecipient: "0x0000000000000000000000000000000000000000",
        stateRoot: result.stateRoot,
        receiptsRoot: result.receiptsRoot,
        logsBloom: result.logsBloom,
        prevRandao:
          "0x9cbea0de83b440f4462c8280a4b0b4590cdb452069757e2c510cb3456b6c98cc",
        blockNumber: "0x1",
        gasLimit: "0x5d21dba00",
        gasUsed: result.gasUsed,
        timestamp: intToHex(Math.floor(Date.now() / 1000)),
        extraData: "0x",
        baseFeePerGas: result.currentBaseFee,
        blockHash: result.receipts[0].blockHash,
        transactions: [bytesToHex(signedTx.serialize())],
      },
    ],
    id: 67,
  };

  const response = await send(payload, secret);

  console.log(response);
};

main();
