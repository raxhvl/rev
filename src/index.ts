import "dotenv/config";
import { createLegacyTx } from "@ethereumjs/tx";
import { createBlock, HeaderData } from "@ethereumjs/block";
import { Common, Holesky } from "@ethereumjs/common";
import { buildBlock, createVM } from "@ethereumjs/vm";
import {
  bytesToHex,
  hexToBytes,
  createAddressFromPrivateKey,
  Account,
} from "@ethereumjs/util";
import { send } from "./lib/jwtClient";

const secret = process.env.JWT_SECRET || "";
const accountKey = process.env.ACCOUNT_1_KEY || "";
const BENEFICIARY = "0x0000000000000000000000000000000000000000";

const main = async () => {
  try {
    const common = new Common({ chain: Holesky });
    const vm = await createVM({ common });

    const genesisBlock = createBlock({ header: { number: 0n } });

    const headerData: HeaderData = {
      number: 1n,
      timestamp: Math.floor(Date.now() / 1000),
      coinbase: BENEFICIARY,
      baseFeePerGas: 1n,
    };

    const blockBuilder = await buildBlock(vm, {
      parentBlock: genesisBlock,
      headerData,
      blockOpts: {
        calcDifficultyFromHeader: genesisBlock.header,
        freeze: false,
        skipConsensusFormatValidation: true,
        putBlockIntoBlockchain: false,
      },
    });

    const pk = hexToBytes(accountKey);
    const address = createAddressFromPrivateKey(pk);
    const account = new Account(0n, 0xfffffffffn);
    await vm.stateManager.putAccount(address, account);

    for (let i = 0; i < 10; i++) {
      const tx = createLegacyTx(
        {
          nonce: i,
          to: "0x000000000000000000000000000000000000000a",
          value: 1,
          gasPrice: 1,
          gasLimit: 21000,
        },
        { common }
      ).sign(pk);

      await blockBuilder.addTransaction(tx);
    }

    const block = await blockBuilder.build();

    const response = await send(
      {
        jsonrpc: "2.0",
        method: "engine_newPayloadV1",
        params: [block.toExecutionPayload()],
        id: 67,
      },
      secret
    );

    console.log("Response:", response);
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
