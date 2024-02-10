import { LanguagePluginConfig, Texts } from "@cole-framework/cole-cli-core";
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
export const createProjectBuildStrategy = (texts: Texts, ...args: unknown[]) =>
  new TypeScriptProjectBuildStrategy(texts);
export const createProjectInitStrategy = (texts: Texts, ...args: unknown[]) =>
  new TypeScriptProjectInitStrategy(texts);

export const Config: LanguagePluginConfig = ConfigJson;
