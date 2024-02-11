import { join, dirname } from "path";
import { existsSync, mkdirSync } from "fs";
import {
  Strategy,
  Texts,
  Result,
  ProjectDescription,
  PluginMap,
  LanguageDI,
} from "@cole-framework/cole-cli-core";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import { execAsync } from "../core";

import TSconfig from "../config/tsconfig.json";

export class TypeScriptProjectBuildStrategy extends Strategy {
  constructor(
    private texts: Texts,
    private pluginMap: PluginMap
  ) {
    super();
  }

  async installPackage(pckg) {
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

      await execAsync(`npm install ${pckgName} ${flag}`).catch((e) => {
        return reject(e);
      });

      return resolve(true);
    });
  }

  async apply(project: ProjectDescription): Promise<Result> {
    try {
      const { texts, pluginMap } = this;
      const {
        name,
        database,
        source,
        author,
        description,
        license,
        web_framework,
        service,
        dependency_injection,
      } = project;
      let success = true;

      const packageJson = {
        name,
        version: "0.0.0",
        description: description || "",
        main: `build/index.js`,
        scripts: {
          test: 'echo "Error: no test specified" && exit 1',
        },
        author: author || "",
        license: license || "ISC",
      };

      await writeFile(
        "package.json",
        JSON.stringify(packageJson, null, 2)
      ).catch((e) => {
        success = false;
        console.log(e);
      });
      await execAsync("npm init -y").catch((e) => {
        success = false;
        console.log(e);
      });
      await execAsync("npm install typescript --save").catch((e) => {
        success = false;
        console.log(e);
      });
      await execAsync("npm install @types/node --save-dev").catch((e) => {
        success = false;
        console.log(e);
      });
      const tsPlugin = pluginMap.getLanguage("typescript");
      const { packages } = tsPlugin;

      for (const pckg of packages) {
        await this.installPackage(pckg).catch((e) => {
          success = false;
          console.log(e);
        });
      }

      let ldi: LanguageDI;

      if (dependency_injection) {
        ldi = tsPlugin.dependency_injection.find(
          (d) => d.alias === dependency_injection
        );

        if (Array.isArray(ldi.packages)) {
          await ldi.packages.reduce(async (prev, p) => {
            await prev;
            await this.installPackage(p).catch((e) => {
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

      database.forEach(async (db) => {
        const dblc = db.toLowerCase();
        const { packages, plugins } = pluginMap.getDatabase(dblc);
        const pckgs = packages["typescript"];
        const plugin = plugins["typescript"];

        await pckgs.reduce(async (prev, p) => {
          await prev;
          await this.installPackage(p).catch((e) => {
            success = false;
            console.log(e);
          });
        }, Promise.resolve());

        if (plugin) {
          await execAsync(`npm install ${plugin} --save`).catch((e) => {
            success = false;
            console.log(e);
          });
        }
      });

      if (web_framework) {
        const framework = pluginMap.getWebFramework(web_framework);
        const pckgs = framework.packages["typescript"];
        const plugin = framework.plugins["typescript"];

        await pckgs.reduce(async (prev, p) => {
          await prev;
          await this.installPackage(p).catch((e) => {
            success = false;
            console.log(e);
          });
        }, Promise.resolve());

        if (plugin) {
          await execAsync(`npm install ${plugin} --save`).catch((e) => {
            success = false;
            console.log(e);
          });
        }
      }

      if (service) {
        const srv = pluginMap.getService(service);
        const pckgs = srv.packages["typescript"];
        const plugin = srv.plugins["typescript"];

        await pckgs.reduce(async (prev, p) => {
          await prev;
          await this.installPackage(p).catch((e) => {
            success = false;
            console.log(e);
          });
        }, Promise.resolve());

        if (plugin) {
          await execAsync(`npm install ${plugin} --save`).catch((e) => {
            success = false;
            console.log(e);
          });
        }
      }

      if (source) {
        const srcPath = join(process.cwd(), source);
        if (existsSync(srcPath) === false) {
          mkdirSync(srcPath, { recursive: true });
        }
      }

      if (success) {
        console.log(chalk.green(texts.get("project_setup_complete")));
      } else {
        console.log(chalk.red(texts.get("project_setup_errors")));
      }
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(error);
    }
  }
}
