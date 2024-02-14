import { exec } from "child_process";
import ora from "ora";

const spinner = ora();
let isSpinning = false;

const startSpinner = (message?: string) => {
  if (!isSpinning) {
    spinner.start(message);
    isSpinning = true;
  }
};

const stopSpinner = () => {
  if (isSpinning) {
    spinner.stop();
    isSpinning = false;
  }
};

export const execAsync = async (
  command: string,
  spinnerMessage?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const process = exec(command);
    startSpinner(spinnerMessage);
    process.on("close", (code) => {
      stopSpinner();
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command}" exited with code ${code}`));
      }
    });
  });
};
