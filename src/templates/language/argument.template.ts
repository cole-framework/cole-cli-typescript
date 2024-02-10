import { ParamTemplateModel } from "@cole-framework/cole-cli-core";

export const ARGUMENT_TEMPLATE = `_NAME__VALUE_`;

export class ArgumentTemplate {
  static parse(model: ParamTemplateModel): string {
    if (model.value) {
      return typeof model.value === "string"
        ? `"${model.value}"`
        : typeof model.value === "object"
          ? JSON.stringify(model.value, null, 2)
          : model.value;
    }
    return model.name;
  }
}
