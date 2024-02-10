import { MethodTemplateModel } from "@cole-framework/cole-cli-core";
import { ComponentTemplates } from "../components";
import { ArgumentTemplate } from "./argument.template";
import { ParamTemplate } from "./param.template";

export const METHOD_TEMPLATE = `_ACCESS_ _STATIC_ _ASYNC_ _NAME_(_PARAMS_)_RETURN_TYPE_ {
  _SUPER_
  _BODY_
}`;
export const ABSTRACT_METHOD_TEMPLATE = `_ACCESS_ abstract _ASYNC_ _NAME_(_PARAMS_)_RETURN_TYPE_;`;
export const INTERFACE_METHOD_TEMPLATE = `_ASYNC_ _NAME_(_PARAMS_)_RETURN_TYPE_;`;

export class MethodTemplate {
  static parse(
    model: MethodTemplateModel,
    elementType: "class" | "abstract_class" | "interface"
  ): string {
    if (model.template) {
      return ComponentTemplates.get(model.template)(model, elementType);
    }

    const _ACCESS_ = model.access || "";
    const _ASYNC_ = model.is_async ? "async" : "";
    const _STATIC_ = model.is_static ? "static" : "";
    const _PARAMS_ = model.params.map((p) => ParamTemplate.parse(p)).join(", ");

    let _SUPER_ = "";
    const _RETURN_TYPE_ = model.return_type
      ? model.is_async
        ? `: Promise<${model.return_type}>`
        : `: ${model.return_type}`
      : "";

    if (elementType === "abstract_class") {
      return ABSTRACT_METHOD_TEMPLATE.replace("_ACCESS_", _ACCESS_)
        .replace("_ASYNC_", _ASYNC_)
        .replace("_NAME_", model.name)
        .replace("_PARAMS_", _PARAMS_)
        .replace("_RETURN_TYPE_", _RETURN_TYPE_)
        .replace(/[ ]+/g, " ")
        .replace(/^(\s*\n\s*)+$/gm, "\n");
    }

    if (elementType === "interface") {
      return INTERFACE_METHOD_TEMPLATE.replace("_ASYNC_", _ASYNC_)
        .replace("_NAME_", model.name)
        .replace("_PARAMS_", _PARAMS_)
        .replace("_RETURN_TYPE_", _RETURN_TYPE_)
        .replace(/[ ]+/g, " ")
        .replace(/^(\s*\n\s*)+$/gm, "\n");
    }

    if (model.supr) {
      if (model.supr.params.length > 0) {
        _SUPER_ = `super(${model.supr.params
          .reduce((acc, p) => {
            if (p) {
              acc.push(ArgumentTemplate.parse(p));
            }

            return acc;
          }, [])
          .join(", ")});`;
      } else {
        _SUPER_ = "super();";
      }
    }

    let _BODY_ = "";

    if (model.body.templateName) {
      _BODY_ = `// ${model.body.instruction}`;
    } else if (model.body.content) {
      _BODY_ = model.body.content;
    }

    return METHOD_TEMPLATE.replace("_ACCESS_", _ACCESS_)
      .replace("_STATIC_", _STATIC_)
      .replace("_ASYNC_", _ASYNC_)
      .replace("_NAME_", model.name)
      .replace("_PARAMS_", _PARAMS_)
      .replace("_RETURN_TYPE_", _RETURN_TYPE_)
      .replace("_SUPER_", _SUPER_)
      .replace("_BODY_", _BODY_)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}
