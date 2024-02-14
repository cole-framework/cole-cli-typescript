import { join, dirname } from "path";
import chalk from "chalk";
import { existsSync, mkdirSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
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
import {
  DependenciesTemplate,
  LauncherTemplate,
  RoutesTemplate,
} from "../templates";
import { DependenciesError } from "./errors";

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
      return execAsync(
        `npm install ${pckgName} ${flag}`,
        `Installing ${pckgName} ...`
      );
    }

    return true;
  }

  async installDependencies(project: ProjectDescription) {
    const { pluginMap, texts } = this;
    const { database, web_framework, service, dependency_injection } = project;
    const packageString = await readFile("./package.json", "utf-8");

    if (!packageString) {
      throw Error("no_package_json_detected__use_new_project_command");
    }

    const packageJson = JSON.parse(packageString);
    const dependencies = Object.keys(packageJson.dependencies);
    const tsPlugin = pluginMap.getLanguage("typescript");
    const { plugin } = tsPlugin;
    const failed = [];

    try {
      if (this.hasDependency(dependencies, plugin) === false) {
        await execAsync(
          `npm install ${plugin} --save`,
          `Installing ${plugin} ...`
        ).catch((e) => {
          failed.push(plugin);
        });
      }

      for (const db of database) {
        const dblc = db.toLowerCase();
        const dbConfig = pluginMap.getDatabase(dblc);
        if (dbConfig) {
          const { packages, plugins } = dbConfig;
          const pckgs = packages["typescript"];
          const plugin = plugins["typescript"];

          for (const pckg of pckgs) {
            await this.installPackage(pckg, dependencies).catch((e) =>
              failed.push(pckg)
            );
          }

          if (plugin && this.hasDependency(dependencies, plugin) === false) {
            await execAsync(
              `npm install ${plugin} --save`,
              `Installing ${plugin} ...`
            ).catch((e) => failed.push(plugin));
          }
        } else {
          console.log(texts.get(`no_config_found_for_#`).replace("#", db));
        }
      }

      if (dependency_injection) {
        const ldi = tsPlugin.dependency_injection.find(
          (d) => d.alias === dependency_injection
        );

        if (Array.isArray(ldi.packages)) {
          for (const pckg of ldi.packages) {
            await this.installPackage(pckg, dependencies).catch((e) => {
              failed.push(pckg);
            });
          }
        }
      }

      if (web_framework) {
        const framework = pluginMap.getWebFramework(web_framework);
        if (framework) {
          const { packages, plugins } = framework;
          const pckgs = packages["typescript"];
          const plugin = plugins["typescript"];

          for (const pckg of pckgs) {
            await this.installPackage(pckg, dependencies).catch((e) =>
              failed.push(pckg)
            );
          }

          if (plugin && this.hasDependency(dependencies, plugin) === false) {
            await execAsync(
              `npm install ${plugin} --save`,
              `Installing ${plugin} ...`
            ).catch((e) => failed.push(plugin));
          }
        } else {
          console.log(
            texts.get(`no_config_found_for_#`).replace("#", framework.name)
          );
        }
      }

      if (service) {
        const srv = pluginMap.getWebFramework(service);
        if (srv) {
          const { packages, plugins } = srv;
          const pckgs = packages["typescript"];
          const plugin = plugins["typescript"];

          for (const pckg of pckgs) {
            await this.installPackage(pckg, dependencies).catch((e) =>
              failed.push(pckg)
            );
          }

          if (plugin && this.hasDependency(dependencies, plugin) === false) {
            await execAsync(
              `npm install ${plugin} --save`,
              `Installing ${plugin} ...`
            ).catch((e) => failed.push(plugin));
          }
        } else {
          console.log(
            texts.get(`no_config_found_for_#`).replace("#", srv.name)
          );
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

        const routesTemplate = RoutesTemplate.parse({
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
      console.log(chalk.green(texts.get("cole_init_complete")));
    } else {
      console.log(chalk.red(texts.get("cole_init_errors")));
    }

    return Result.withoutContent();
  }
}
