export const ROUTES_TEMPLATE = `
import { Router } from "@cole-framework/cole-ts";
__IMPORTS__

export class Routes extends Router {
  public configure(__ARGS__) {
    const { framework } = this;
  }
}
`;

export class RoutesTemplate {
  static parse(model: { dependency_injection: string }): string {
    let __IMPORTS__ = "";
    let __ARGS__ = "";

    if (model.dependency_injection === "inversify") {
      __IMPORTS__ = `import { Container } from 'inversify';`;
      __ARGS__ = "container: Container";
    }

    return ROUTES_TEMPLATE.replace("__IMPORTS__", __IMPORTS__)
      .replace("__ARGS__", __ARGS__)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}
