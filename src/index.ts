import { LanguagePluginConfig, PluginMap, Texts } from "@cole-framework/cole-cli-core";
import {
  TypeScriptFileOutputStrategy,
  TypeScriptProjectBuildStrategy,
  TypeScriptProjectInitStrategy,
  TypeScriptTemplateModelStrategy,
} from "./strategies";
import ConfigJson from "./config/config.json";

export * from "./core";
export * from "./strategies";
export * from "./templates";

export const createTemplateModelStrategy = (...args: unknown[]) =>
  new TypeScriptTemplateModelStrategy();
export const createFileOutputStrategy = (...args: unknown[]) =>
  new TypeScriptFileOutputStrategy();
export const createProjectBuildStrategy = (
  texts: Texts,
  pluginMap: PluginMap,
  ...args: unknown[]
) => new TypeScriptProjectBuildStrategy(texts, pluginMap);
export const createProjectInitStrategy = (
  texts: Texts,
  pluginMap: PluginMap,
  ...args: unknown[]
) => new TypeScriptProjectInitStrategy(texts, pluginMap);

export const Config: LanguagePluginConfig = ConfigJson;
