import { join } from "path";
import { existsSync } from "fs";
import {
  Strategy,
  Texts,
  Result,
  ProjectDescription,
  PluginMap,
} from "@cole-framework/cole-cli-core";
import chalk from "chalk";
import { mkdir, writeFile } from "fs/promises";
import { execAsync } from "../core";

import TSconfig from "../config/tsconfig.json";
import {
  DependenciesTemplate,
  LauncherTemplate,
  RouterTemplate,
} from "../templates";
import { DependenciesError } from "./errors";

export class TypeScriptProjectBuildStrategy extends Strategy {
  constructor(
    private texts: Texts,
    private pluginMap: PluginMap
  ) {
    super();
  }

  async installPackage(pckg) {
    let flag;
    let pckgName;

    if (pckg.startsWith("dev:")) {
      flag = "--save-dev";
      pckgName = pckg.replace("dev:", "");
    } else {
      flag = "--save";
      pckgName = pckg;
    }

    return execAsync(
      `npm install ${pckgName} ${flag}`,
      `Installing ${pckgName} ...`
    );
  }

  async initNodeProject(project: ProjectDescription) {
    const { description, author, license, name } = project;
    try {
      const packageJson = {
        name,
        version: "0.0.0",
        description: description || "",
        main: `build/index.js`,
        scripts: {
          clean: "rm -rf ./build",
          build: "yarn clean && tsc",
          start: "node build/index.js",
          test: 'echo "Error: no test specified" && exit 1',
        },
        author: author || "",
        license: license || "ISC",
      };

      await writeFile("package.json", JSON.stringify(packageJson, null, 2));
      await execAsync("npm init -y");
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(error);
    }
  }

  async installDependencies(project: ProjectDescription) {
    const { service, dependency_injection, database, web_framework } = project;
    const { pluginMap, texts } = this;
    const failed = [];
    try {
      await execAsync(
        "npm install typescript --save",
        "Installing typescript ..."
      ).catch((e) => {
        failed.push("typescript");
      });
      await execAsync(
        "npm install @types/node --save-dev",
        "Installing @types/node ..."
      ).catch((e) => {
        failed.push("@types/node");
      });
      const tsPlugin = pluginMap.getLanguage("typescript");
      const { packages } = tsPlugin;

      for (const pckg of packages) {
        await this.installPackage(pckg).catch((e) => {
          failed.push(pckg);
        });
      }

      for (const db of database) {
        const dblc = db.toLowerCase();

        if (dblc === "cache") {
          continue;
        }

        const dbConfig = pluginMap.getDatabase(dblc);

        if (dbConfig) {
          const { packages, plugins } = dbConfig;
          const pckgs = packages["typescript"];
          const plugin = plugins["typescript"];

          for (const pckg of pckgs) {
            await this.installPackage(pckg).catch((e) => {
              failed.push(pckg);
            });
          }

          if (plugin) {
            await execAsync(
              `npm install ${plugin} --save`,
              `Installing ${plugin} ...`
            ).catch((e) => {
              failed.push(plugin);
            });
          }
        } else {
          console.log(
            chalk.whiteBright(
              texts.get(`no_config_found_for_#`).replace("#", db)
            )
          );
        }
      }

      if (web_framework) {
        const framework = pluginMap.getWebFramework(web_framework);
        if (framework) {
          const pckgs = framework.packages["typescript"];
          const plugin = framework.plugins["typescript"];

          for (const pckg of pckgs) {
            await this.installPackage(pckg).catch((e) => {
              failed.push(pckg);
            });
          }

          if (plugin) {
            await execAsync(
              `npm install ${plugin} --save`,
              `Installing ${plugin} ...`
            ).catch((e) => {
              failed.push(plugin);
            });
          }
        } else {
          console.log(
            texts.get(`no_config_found_for_#`).replace("#", framework.name)
          );
        }
      }

      if (service) {
        const srv = pluginMap.getService(service);
        if (srv) {
          const pckgs = srv.packages["typescript"];
          const plugin = srv.plugins["typescript"];

          for (const pckg of pckgs) {
            await this.installPackage(pckg).catch((e) => {
              failed.push(pckg);
            });
          }

          if (plugin) {
            await execAsync(
              `npm install ${plugin} --save`,
              `Installing ${plugin} ...`
            ).catch((e) => {
              failed.push(plugin);
            });
          }
        } else {
          console.log(
            texts.get(`no_config_found_for_#`).replace("#", srv.name)
          );
        }
      }

      if (dependency_injection) {
        const ldi = tsPlugin.dependency_injection.find(
          (d) => d.alias === dependency_injection
        );

        if (Array.isArray(ldi.packages)) {
          for (const pckg of ldi.packages) {
            await this.installPackage(pckg).catch((e) => {
              failed.push(pckg);
            });
          }
        }
      }
      if (failed.length > 0) {
        return Result.withFailure(new DependenciesError(failed));
      }
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(error);
    }
  }

  async createTSconfig() {
    try {
      await writeFile("tsconfig.json", JSON.stringify(TSconfig, null, 2));
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(error);
    }
  }

  async createSource(project: ProjectDescription) {
    const { source, web_framework, dependency_injection } = project;
    try {
      if (source) {
        const srcPath = join(process.cwd(), source);

        if (existsSync(srcPath) === false) {
          mkdir(srcPath, { recursive: true });
        }

        const launcherTemplate = LauncherTemplate.parse({
          web_framework,
          dependency_injection,
        });
        await writeFile(join(srcPath, "index.ts"), launcherTemplate);

        const routesTemplate = RouterTemplate.parse({
          dependency_injection,
        });
        await writeFile(join(srcPath, "routes.ts"), routesTemplate);

        const dependenciesTemplate = DependenciesTemplate.parse({
          dependency_injection,
        });
        await writeFile(join(srcPath, "dependencies.ts"), dependenciesTemplate);
      }
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(error);
    }
  }

  async apply(project: ProjectDescription): Promise<Result> {
    const { texts } = this;
    let success = true;

    const initResult = await this.initNodeProject(project);

    if (initResult.isFailure) {
      success = false;
      console.log(`🔴`, chalk.whiteBright(texts.get(`init_node_project_#`)));
      console.log(chalk.gray(initResult.failure.error.message));
    } else {
      console.log(`🟢`, chalk.whiteBright(texts.get(`init_node_project_#`)));
    }

    const dependenciesResult = await this.installDependencies(project);

    if (dependenciesResult.isFailure) {
      success = false;
      console.log(`🔴`, chalk.whiteBright(texts.get(`install_dependencies_#`)));
      if (dependenciesResult.failure.error instanceof DependenciesError) {
        console.log(chalk.red("Failed:"));
        console.log(
          chalk.gray(
            " - " + dependenciesResult.failure.error.list.join("\n - ")
          )
        );
      } else {
        console.log(chalk.gray(dependenciesResult.failure.error.message));
      }
    } else {
      console.log(`🟢`, chalk.whiteBright(texts.get(`install_dependencies_#`)));
    }

    const tsConfigResult = await this.createTSconfig();

    if (tsConfigResult.isFailure) {
      success = false;
      console.log(`🔴`, chalk.whiteBright(texts.get(`create_tsconfig_#`)));
      console.log(chalk.gray(tsConfigResult.failure.error.message));
    } else {
      console.log(`🟢`, chalk.whiteBright(texts.get(`create_tsconfig_#`)));
    }

    const sourceResult = await this.createSource(project);

    if (sourceResult.isFailure) {
      success = false;
      console.log(`🔴`, chalk.whiteBright(texts.get(`create_source_#`)));
      console.log(chalk.gray(sourceResult.failure.error.message));
    } else {
      console.log(`🟢`, chalk.whiteBright(texts.get(`create_source_#`)));
    }

    if (success) {
      console.log(chalk.green(texts.get("project_setup_complete")));
    } else {
      console.log(chalk.red(texts.get("project_setup_errors")));
    }

    return Result.withoutContent();
  }
}
