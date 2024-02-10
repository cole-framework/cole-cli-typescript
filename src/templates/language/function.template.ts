import { FunctionTemplateModel } from "@cole-framework/cole-cli-core";
import { ComponentTemplates } from "../components";
import { GenericTemplate } from "./generic.template";
import { ParamTemplate } from "./param.template";

export const FUNCTION_TEMPLATE = `_EXPORT_ _ASYNC_ function _NAME__GENERICS_(_PARAMS_)_RETURN_TYPE_ {
  _BODY_
};`;

export class FunctionTemplate {
  static parse(model: FunctionTemplateModel): string {
    if (model.template) {
      return ComponentTemplates.get(model.template)(model);
    }

    const _NAME_ = model.name;
    const _ASYNC_ = model.is_async ? "async " : "";
    const _PARAMS_ = model.params.map((p) => ParamTemplate.parse(p)).join(", ");
    const _RETURN_TYPE_ = model.return_type
      ? model.is_async
        ? `: Promise<${model.return_type}>`
        : `: ${model.return_type}`
      : "";

    const _EXPORT_ = model.exp
      ? model.exp.is_default
        ? "export default "
        : "export "
      : "";
    const _GENERICS_ =
      model.generics.length > 0
        ? `<${model.generics.map((p) => GenericTemplate.parse(p)).join(", ")}>`
        : "";

    let _BODY_ = "";

    if (model.body.templateName) {
      _BODY_ = `// ${model.body.instruction}`;
    } else if (model.body.content) {
      _BODY_ = model.body.content;
    }

    return FUNCTION_TEMPLATE.replace("_EXPORT_", _EXPORT_)
      .replace("_ASYNC_", _ASYNC_)
      .replace("_NAME_", _NAME_)
      .replace("_PARAMS_", _PARAMS_)
      .replace("_GENERICS_", _GENERICS_)
      .replace("_RETURN_TYPE_", _RETURN_TYPE_)
      .replace("_BODY_", _BODY_)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}
