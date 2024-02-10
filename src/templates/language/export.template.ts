import { ExportTemplateModel } from "@cole-framework/cole-cli-core";

export const EXPORT_TEMPLATE = `export _EXPORT_ from "_PATH_";`;

export class ExportTemplate {
  static parse(model: ExportTemplateModel): string {
    let _EXPORT_ = "*";
    const _PATH_ = model.path;

    return EXPORT_TEMPLATE.replace("_EXPORT_", _EXPORT_)
      .replace("_PATH_", _PATH_)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n")
      .trim();
  }
}
