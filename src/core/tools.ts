import { exec } from "child_process";

export const execAsync = async (command: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const process = exec(command);

    process.stdout?.on("data", (data) => {
      console.log(data.toString());
    });

    process.stderr?.on("data", (data) => {
      console.error(data.toString());
    });

    process.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command}" exited with code ${code}`));
      }
    });
  });
};
