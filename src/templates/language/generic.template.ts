import { GenericTemplateModel } from "@cole-framework/cole-cli-core";

export const GENERIC_TEMPLATE = `_NAME_ _INHERITANCE_ _DEFAULT_`;

export class GenericTemplate {
  static parse(model: GenericTemplateModel): string {
    const { name, dflt, inheritance } = model;
    const _NAME_ = name || "";
    const _DEFAULT_ = dflt || "";
    const _INHERITANCE_ = inheritance ? ` extends ${inheritance.name}` : "";

    return GENERIC_TEMPLATE.replace("_NAME_", _NAME_)
      .replace("_INHERITANCE_", _INHERITANCE_)
      .replace("_DEFAULT_", _DEFAULT_)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n")
      .trim();
  }
}
