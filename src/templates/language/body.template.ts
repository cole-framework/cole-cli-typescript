import { BodyTemplateModel } from "@cole-framework/cole-cli-core";
import { ComponentTemplates } from "../components";

export class BodyTemplate {
  static parse(model: BodyTemplateModel): string {
    if (model.template) {
      return ComponentTemplates.get(model.template)(model);
    }
    if (model.content) {
      return `/* ${model.content} */`;
    }

    return "";
  }
}
