import "dotenv/config";
import { createLegacyTx } from "@ethereumjs/tx";
import { createBlock } from "@ethereumjs/block";
import { Common, Mainnet } from "@ethereumjs/common";
import { buildBlock, createVM } from "@ethereumjs/vm";
import {
  bytesToHex,
  hexToBytes,
  createAddressFromPrivateKey,
  Account,
} from "@ethereumjs/util";

const secret = process.env.JWT_SECRET || "";

const BENEFICIARY = "0x0000000000000000000000000000000000000000";

const main = async () => {
  const common = new Common({ chain: Mainnet });
  const vm = await createVM({ common });

  const parentBlock = createBlock(
    { header: { number: 1n } },
    { skipConsensusFormatValidation: true }
  );
  const headerData = {
    number: 2n,
  };
  const blockBuilder = await buildBlock(vm, {
    parentBlock,
    headerData,
    blockOpts: {
      calcDifficultyFromHeader: parentBlock.header,
      freeze: false,
      skipConsensusFormatValidation: true,
      putBlockIntoBlockchain: false,
    },
  });

  const pk = hexToBytes(process.env.ACCOUNT_1_KEY);
  const address = createAddressFromPrivateKey(pk);
  const account = new Account(0n, 0xfffffffffn);
  await vm.stateManager.putAccount(address, account);

  const tx = createLegacyTx({ gasLimit: 0xffffff, gasPrice: 75n }).sign(pk);
  await blockBuilder.addTransaction(tx);

  // Add more transactions
  const block = await blockBuilder.build();
  console.log(`Built a block with hash ${bytesToHex(block.hash())}`);
};

main();
