import { exec } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";

export function t8n(preState: object, txs: any): Promise<string> {
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
      resolve(stdout);
    });
  });
}
