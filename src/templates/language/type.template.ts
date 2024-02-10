import { TypeTemplateModel } from "@cole-framework/cole-cli-core";
import { GenericTemplate } from "./generic.template";
import { PropTemplate } from "./prop.template";

export const TYPE_TEMPLATE = `_EXPORT_type _NAME__GENERICS_ = {
  _PROPS_
}`;
export const ALIAS_TEMPLATE = `_EXPORT_type _NAME__GENERICS_ = _ALIAS_`;

export class TypeTemplate {
  static parse(model: TypeTemplateModel): string {
    const _NAME_ = model.name;
    const _GENERICS_ =
      model.generics.length > 0
        ? `<${model.generics.map((p) => GenericTemplate.parse(p)).join(", ")}>`
        : "";
    const _EXPORT_ = model.exp
      ? model.exp.is_default
        ? "export default "
        : "export "
      : "";

    if (model.alias) {
      const _ALIAS_ = model.alias || "";
      return ALIAS_TEMPLATE.replace("_EXPORT_", _EXPORT_)
        .replace("_NAME_", _NAME_)
        .replace("_GENERICS_", _GENERICS_)
        .replace("_ALIAS_", _ALIAS_)
        .replace(/[ ]+/g, " ")
        .replace(/^(\s*\n\s*)+$/gm, "\n");
    }

    const _PROPS_ = model.props.map((p) => PropTemplate.parse(p, "type")).join(`
    `);

    return TYPE_TEMPLATE.replace("_EXPORT_", _EXPORT_)
      .replace("_NAME_", _NAME_)
      .replace("_PROPS_", _PROPS_)
      .replace("_GENERICS_", _GENERICS_)
      .replace("_PROPS_", _PROPS_)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}
