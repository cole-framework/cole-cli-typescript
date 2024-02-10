import { join, dirname } from "path";
import chalk from "chalk";
import { existsSync, mkdirSync } from "fs";
import { readFile } from "fs/promises";
import {
  Strategy,
  Texts,
  ProjectDescription,
  Result,
  PluginMap,
} from "@cole-framework/cole-cli-core";
import { execAsync } from "../core";

export class TypeScriptProjectInitStrategy extends Strategy {
  constructor(private texts: Texts) {
    super();
  }

  hasDependency(dependencies: string[], name: string, version?: string) {
    const fullName = `${name}${version ? "@" + version : ""}`;

    for (const dependency of dependencies) {
      if (dependency === fullName) {
        return true;
      }
    }

    return false;
  }

  async apply(
    project: ProjectDescription,
    pluginMap: PluginMap
  ): Promise<Result> {
    try {
      const { texts } = this;
      const { database, web_framework, service, source } = project;
      const packageString = await readFile("./package.json", "utf-8");
      let success = true;

      if (!packageString) {
        throw Error("no_package_json_detected__use_new_project_command");
      }

      const packageJson = JSON.parse(packageString);
      const dependencies = Object.keys(packageJson.dependencies);
      const { plugin } = pluginMap.getLanguage("typescript");

      if (this.hasDependency(dependencies, plugin) === false) {
        await execAsync(`npm install ${plugin} --save`);
      }

      database.forEach(async (db) => {
        const dblc = db.toLowerCase();
        const { packages, plugins } = pluginMap.getDatabase(dblc);
        const pckgs = packages["typescript"];
        const plugin = plugins["typescript"];

        for (const pckg of pckgs) {
          if (pckg && this.hasDependency(dependencies, pckg) === false) {
            await execAsync(`npm install ${pckg} --save`).catch((e) => {
              success = false;
              console.log(e);
            });
          }
        }

        if (plugin && this.hasDependency(dependencies, plugin) === false) {
          await execAsync(`npm install ${plugin} --save`).catch((e) => {
            success = false;
            console.log(e);
          });
        }
      });

      if (web_framework) {
        const { packages, plugins } = pluginMap.getWebFramework(web_framework);
        const pckgs = packages["typescript"];
        const plugin = plugins["typescript"];
        for (const pckg of pckgs) {
          if (pckg && this.hasDependency(dependencies, pckg) === false) {
            await execAsync(`npm install ${pckg} --save`).catch((e) => {
              success = false;
              console.log(e);
            });
          }
        }

        if (plugin && this.hasDependency(dependencies, plugin) === false) {
          await execAsync(`npm install ${plugin} --save`).catch((e) => {
            success = false;
            console.log(e);
          });
        }
      }

      if (service) {
        const { packages, plugins } = pluginMap.getWebFramework(service);
        const pckgs = packages["typescript"];
        const plugin = plugins["typescript"];

        for (const pckg of pckgs) {
          if (pckg && this.hasDependency(dependencies, pckg) === false) {
            await execAsync(`npm install ${pckg} --save`).catch((e) => {
              success = false;
              console.log(e);
            });
          }
        }

        if (plugin && this.hasDependency(dependencies, plugin) === false) {
          await execAsync(`npm install ${plugin} --save`).catch((e) => {
            success = false;
            console.log(e);
          });
        }
      }

      if (source) {
        const srcPath = join(process.cwd(), source);
        if (existsSync(srcPath) === false) {
          mkdirSync(dirname(srcPath), { recursive: true });
        }
      }

      if (success) {
        console.log(chalk.green(texts.get("cole_init_complete")));
      } else {
        console.log(chalk.red(texts.get("cole_init_errors")));
      }
      return Result.withoutContent();
    } catch (error) {}
  }
}
