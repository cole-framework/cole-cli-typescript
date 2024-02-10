import { PropTemplateModel } from "@cole-framework/cole-cli-core";
import { ComponentTemplates } from "../components";

export const PROP_TEMPLATE = `_ACCESS_ _STATIC_ _READONLY_ _NAME__OPTIONAL_ _TYPE_ _VALUE_;`;

export class PropTemplate {
  static parse(
    model: PropTemplateModel,
    elementType: "class" | "interface" | "type" = "class"
  ): string {
    if (model.template) {
      return ComponentTemplates.get(model.template)(model, elementType);
    }

    const _OPTIONAL_ = model.is_optional ? "?" : "";
    const _ACCESS_ = elementType === "class" ? model.access || "public" : "";
    const _READONLY_ =
      elementType === "class" && model.is_readonly ? "readonly " : "";
    const _STATIC_ =
      elementType === "class" && model.is_static ? "static " : "";
    const _TYPE_ = model.type ? `: ${model.type}` : "";
    const _VALUE_ =
      elementType === "class" && model.value ? ` = ${model.value}` : "";

    return PROP_TEMPLATE.replace("_ACCESS_", _ACCESS_)
      .replace("_STATIC_", _STATIC_)
      .replace("_READONLY_", _READONLY_)
      .replace("_NAME_", model.name)
      .replace("_OPTIONAL_", _OPTIONAL_)
      .replace("_TYPE_", _TYPE_)
      .replace("_VALUE_", _VALUE_)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}
