import { join, dirname } from "path";
import { existsSync, mkdirSync } from "fs";
import {
  Strategy,
  Texts,
  Result,
  ProjectDescription,
  PluginMap,
} from "@cole-framework/cole-cli-core";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import { execAsync } from "../core";

export class TypeScriptProjectBuildStrategy extends Strategy {
  constructor(private texts: Texts) {
    super();
  }

  async apply(
    project: ProjectDescription,
    pluginMap: PluginMap
  ): Promise<Result> {
    try {
      const { texts } = this;
      const {
        name,
        database,
        source,
        author,
        description,
        license,
        web_framework,
        service,
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
      await execAsync("npm install typescript @types/node --save-dev").catch(
        (e) => {
          success = false;
          console.log(e);
        }
      );
      const { packages } = pluginMap.getLanguage("typescript");

      await execAsync(`npm install ${packages.join(" ")} --save`).catch((e) => {
        success = false;
        console.log(e);
      });
      await execAsync("npx tsc --init").catch((e) => {
        success = false;
        console.log(e);
      });

      database.forEach(async (db) => {
        const dblc = db.toLowerCase();
        const { packages, plugins } = pluginMap.getDatabase(dblc);
        const pckgs = packages["typescript"];
        const plugin = plugins["typescript"];

        if (pckgs.length > 0) {
          await execAsync(`npm install ${pckgs.join(" ")} --save`).catch(
            (e) => {
              success = false;
              console.log(e);
            }
          );
        }

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

        if (pckgs.length > 0) {
          await execAsync(`npm install ${pckgs.join(" ")} --save`).catch(
            (e) => {
              success = false;
              console.log(e);
            }
          );
        }

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

        if (pckgs.length > 0) {
          await execAsync(`npm install ${pckgs.join(" ")} --save`).catch(
            (e) => {
              success = false;
              console.log(e);
            }
          );
        }

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
          mkdirSync(dirname(srcPath), { recursive: true });
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
