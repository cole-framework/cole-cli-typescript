import { join, dirname } from "path";
import chalk from "chalk";
import { existsSync, mkdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import {
  Strategy,
  Texts,
  ProjectDescription,
  Result,
  PluginMap,
  LanguageDI,
} from "@cole-framework/cole-cli-core";
import { execAsync } from "../core";

import TSconfig from "../config/tsconfig.json";

export class TypeScriptProjectInitStrategy extends Strategy {
  constructor(
    private texts: Texts,
    private pluginMap: PluginMap
  ) {
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

  async installPackage(pckg, dependencies) {
    return new Promise(async (resolve, reject) => {
      let flag;
      let pckgName;

      if (pckg.startsWith("dev:")) {
        flag = "--save-dev";
        pckgName = pckg.replace("dev:", "");
      } else {
        flag = "--save";
        pckgName = pckg;
      }
      if (this.hasDependency(dependencies, pckgName) === false) {
        await execAsync(`npm install ${pckgName} ${flag}`).catch((e) => {
          return reject(e);
        });
      }
      return resolve(true);
    });
  }

  async apply(project: ProjectDescription): Promise<Result> {
    try {
      const { texts, pluginMap } = this;
      const { database, web_framework, service, source, dependency_injection } =
        project;
      const packageString = await readFile("./package.json", "utf-8");
      let success = true;

      if (!packageString) {
        throw Error("no_package_json_detected__use_new_project_command");
      }

      const packageJson = JSON.parse(packageString);
      const dependencies = Object.keys(packageJson.dependencies);
      const tsPlugin = pluginMap.getLanguage("typescript");
      const { plugin } = tsPlugin;

      if (this.hasDependency(dependencies, plugin) === false) {
        await execAsync(`npm install ${plugin} --save`);
      }

      database.forEach(async (db) => {
        const dblc = db.toLowerCase();
        const { packages, plugins } = pluginMap.getDatabase(dblc);
        const pckgs = packages["typescript"];
        const plugin = plugins["typescript"];

        for (const pckg of pckgs) {
          await this.installPackage(pckg, dependencies).catch((e) => {
            success = false;
            console.log(e);
          });
        }

        if (plugin && this.hasDependency(dependencies, plugin) === false) {
          await execAsync(`npm install ${plugin} --save`).catch((e) => {
            success = false;
            console.log(e);
          });
        }
      });

      let ldi: LanguageDI;

      if (dependency_injection) {
        ldi = tsPlugin.dependency_injection.find(
          (d) => d.alias === dependency_injection
        );

        if (Array.isArray(ldi.packages)) {
          await ldi.packages.reduce(async (prev, p) => {
            await prev;
            await this.installPackage(p, dependencies).catch((e) => {
              success = false;
              console.log(e);
            });
          }, Promise.resolve());
        } else {
          //
        }
      }

      if (ldi) {
        await writeFile(
          "tsconfig.json",
          JSON.stringify(TSconfig, null, 2)
        ).catch((e) => {
          success = false;
          console.log(e);
        });
      } else {
        await execAsync("npx tsc --init").catch((e) => {
          success = false;
          console.log(e);
        });
      }

      if (web_framework) {
        const { packages, plugins } = pluginMap.getWebFramework(web_framework);
        const pckgs = packages["typescript"];
        const plugin = plugins["typescript"];
        for (const pckg of pckgs) {
          await this.installPackage(pckg, dependencies).catch((e) => {
            success = false;
            console.log(e);
          });
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
          await this.installPackage(pckg, dependencies).catch((e) => {
            success = false;
            console.log(e);
          });
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
