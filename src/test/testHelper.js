import { resolve } from "path";

/**
 * @param {import("child_process").ChildProcessWithoutNullStreams} process
 * @returns {Promise<undefined|Error>}
 */
export function checkOutput(process) {
  return new Promise((reject, resolve) => {
    let output = "";
    process.stdout.on("data", (data) => {
      const text = data.toString();
      output += text;
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `k6 process failed with exit code ${code}. Error: ${output}`,
          ),
        );
      }
    });
  });
}
