import { InterfaceTemplateModel } from "@cole-framework/cole-cli-core";
import { GenericTemplate } from "./generic.template";
import { InheritanceTemplate } from "./inheritance.template";
import { MethodTemplate } from "./method.template";

import { PropTemplate } from "./prop.template";

export const INTERFACE_TEMPLATE = `_EXPORT_ interface _NAME__GENERICS_ _INHERITANCE_ {
  _PROPS_
  _METHODS_
}`;

export class InterfaceTemplate {
  static parse(model: InterfaceTemplateModel): string {
    const _GENERICS_ =
      model.generics.length > 0
        ? `<${model.generics.map((p) => GenericTemplate.parse(p)).join(", ")}>`
        : "";
    const _EXPORT_ = model.exp
      ? model.exp.is_default
        ? "export default "
        : "export "
      : "";

    const _INHERITANCE_ =
      model.inheritance.length > 0
        ? ` extends ${InheritanceTemplate.parse(model.inheritance[0])}`
        : "";

    const props = [];
    const methods = [];

    model.props.forEach((p) => {
      if (!p.is_static) {
        props.push(PropTemplate.parse(p, "interface"));
      }
    });

    model.methods.forEach((m) => {
      if (!m.is_static) {
        methods.push(MethodTemplate.parse(m, "interface"));
      }
    });

    const _PROPS_ = props.join(`
    `);
    const _METHODS_ = methods.join(`
    `);

    return INTERFACE_TEMPLATE.replace("_EXPORT_", _EXPORT_)
      .replace("_NAME_", model.name)
      .replace("_GENERICS_", _GENERICS_)
      .replace("_INHERITANCE_", _INHERITANCE_)
      .replace("_PROPS_", _PROPS_)
      .replace("_METHODS_", _METHODS_)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}
