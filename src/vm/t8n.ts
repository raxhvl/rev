import { exec } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";
import { readFileSync } from "fs";
import { WorldState } from "./trie";

type T8nResult = {
  stateRoot: string;
  txRoot: string;
  receiptsRoot: string;
  logsHash: string;
  logsBloom: string;
  receipts: Array<{
    root: string;
    status: string;
    cumulativeGasUsed: string;
    logsBloom: string;
    logs: any;
    transactionHash: string;
    contractAddress: string;
    gasUsed: string;
    effectiveGasPrice: any;
    blockHash: string;
    transactionIndex: string;
  }>;
  currentDifficulty: string;
  gasUsed: string;
  currentBaseFee: string;
};

export function t8n(
  preState: WorldState,
  txs: any
): Promise<{ stdout: string; result: T8nResult; postState: WorldState }> {
  const inputDir = join(__dirname, "input");
  const outputDir = join(__dirname, "output");

  const paths = {
    preState: join(inputDir, "alloc.json"),
    txs: join(inputDir, "txs.json"),
    env: join(inputDir, "env.json"),
    result: join(outputDir, "result.json"),
    postState: join(outputDir, "alloc.json"),
  };

  // Write JSON files
  writeFileSync(paths.preState, JSON.stringify(preState, null, 2));
  writeFileSync(paths.txs, JSON.stringify(txs, null, 2));

  if (!process.env.EVM_BIN_PATH) {
    throw new Error("EVM_BIN_PATH environment variable is not set");
  }

  const command = [
    `${process.env.EVM_BIN_PATH}`,
    `t8n`,
    `--input.alloc ${paths.preState}`,
    `--input.txs ${paths.txs}`,
    `--input.env ${paths.env}`,
    `--output.result ${paths.result}`,
    `--output.alloc ${paths.postState}`,
  ].join(" ");

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        return reject(`Error executing command: ${stderr || error.message}`);
      }

      const result = readFileSync(paths.result, "utf-8");
      const postState = readFileSync(paths.postState, "utf-8");

      resolve({
        stdout,
        result: JSON.parse(result),
        postState: JSON.parse(postState),
      });
    });
  });
}

// Formats the signed transaction JSON object to match the expected format.
// Renames gasLimit to gas and moves data to input if to is not null.
export const formatSignedTx = (signedTxJson: any) => {
  signedTxJson.gas = signedTxJson.gasLimit;
  if (signedTxJson.to != null) {
    signedTxJson.input = signedTxJson.data;
    delete signedTxJson.data;
  }
  delete signedTxJson.gasLimit;
  return signedTxJson;
};
