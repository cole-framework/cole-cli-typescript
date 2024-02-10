import { ParamTemplateModel } from "@cole-framework/cole-cli-core";
import { ComponentTemplates } from "../components";

export const PARAM_TEMPLATE = `_ACCESS_ _READONLY_ _NAME__OPTIONAL__TYPE_ _VALUE_`;

export class ParamTemplate {
  static parse(
    model: ParamTemplateModel,
    options?: { skipAccess?: boolean; skipType?: boolean }
  ): string {
    if (model.template) {
      return ComponentTemplates.get(model.template)(model, options);
    }

    const _ACCESS_ = model.access && !options?.skipAccess ? model.access : "";
    const _READONLY_ = model.is_readonly ? "readonly" : "";
    const _OPTIONAL_ = model.is_optional ? "?" : "";
    const _TYPE_ = model.type && !options?.skipType ? `: ${model.type}` : "";
    const _VALUE_ = model.value ? ` = ${model.value}` : "";

    return PARAM_TEMPLATE.replace("_ACCESS_", _ACCESS_)
      .replace("_READONLY_", _READONLY_)
      .replace("_NAME_", model.name)
      .replace("_OPTIONAL_", _OPTIONAL_)
      .replace("_TYPE_", _TYPE_)
      .replace("_VALUE_", _VALUE_)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}
