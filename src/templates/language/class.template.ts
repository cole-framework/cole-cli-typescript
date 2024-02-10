import { ClassTemplateModel } from "@cole-framework/cole-cli-core";
import { ComponentTemplates } from "../components";
import { ConstructorTemplate } from "./constructor.template";
import { GenericTemplate } from "./generic.template";
import { InheritanceTemplate } from "./inheritance.template";
import { MethodTemplate } from "./method.template";

import { PropTemplate } from "./prop.template";

export const CLASS_TEMPLATE = `_EXPORT_ _ABSTRACT_ class _NAME__GENERICS_ _INHERITANCE_ _INTERFACES_ {
  _STATIC_PROPS_
  _STATIC_METHODS_
  _PROPS_
  _CONSTRUCTOR_
  _METHODS_
}`;

export class ClassTemplate {
  static parse(model: ClassTemplateModel): string {
    if (model.template) {
      return ComponentTemplates.get(model.template)(model);
    }

    const _ABSTRACT_ = model.isAbstract ? "abstract" : "";
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

    const _INTERFACES_ =
      model.interfaces.length > 0
        ? ` implements ${model.interfaces
            .map((i) => InheritanceTemplate.parse(i))
            .join(", ")}`
        : "";

    const _CONSTRUCTOR_ =
      model.ctor?.params.length > 0 ||
      model.ctor?.body?.content ||
      model.ctor?.body?.instruction
        ? ConstructorTemplate.parse(model.ctor)
        : "";

    const props = [];
    const static_props = [];
    const methods = [];
    const static_methods = [];

    model.props.forEach((p) => {
      if (p.is_static) {
        static_props.push(PropTemplate.parse(p));
      } else {
        props.push(PropTemplate.parse(p));
      }
    });

    model.methods.forEach((m) => {
      if (m.is_static) {
        static_methods.push(
          MethodTemplate.parse(m, model.isAbstract ? "abstract_class" : "class")
        );
      } else {
        methods.push(
          MethodTemplate.parse(m, model.isAbstract ? "abstract_class" : "class")
        );
      }
    });

    const _STATIC_PROPS_ = static_props.join(`
    `);
    const _STATIC_METHODS_ = static_methods.join(`
    `);
    const _PROPS_ = props.join(`
    `);
    const _METHODS_ = methods.join(`
    `);

    return CLASS_TEMPLATE.replace("_EXPORT_", _EXPORT_)
      .replace("_ABSTRACT_", _ABSTRACT_)
      .replace("_NAME_", model.name)
      .replace("_GENERICS_", _GENERICS_)
      .replace("_INHERITANCE_", _INHERITANCE_)
      .replace("_INTERFACES_", _INTERFACES_)
      .replace("_STATIC_PROPS_", _STATIC_PROPS_)
      .replace("_STATIC_METHODS_", _STATIC_METHODS_)
      .replace("_PROPS_", _PROPS_)
      .replace("_CONSTRUCTOR_", _CONSTRUCTOR_)
      .replace("_METHODS_", _METHODS_)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}
