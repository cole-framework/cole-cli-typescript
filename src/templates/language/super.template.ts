import { ConstructorTemplateModel } from "@cole-framework/cole-cli-core";
import { ComponentTemplates } from "../components";
import { ArgumentTemplate } from "./argument.template";

export class SuperTemplate {
  static parse(model: ConstructorTemplateModel): string {
    if (model.template) {
      return ComponentTemplates.get(model.template)(model);
    }

    if (model.params.length > 0) {
      return `super(${model.params
        .reduce((acc, p) => {
          if (p) {
            acc.push(ArgumentTemplate.parse(p));
          }

          return acc;
        }, [])
        .join(", ")});`;
    }

    return "super();";
  }
}
