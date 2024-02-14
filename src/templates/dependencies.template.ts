export const DEPENDENCIES_TEMPLATE = `
__IMPORTS__

export class Dependencies {
  configure(__ARGS__) {

  }
}
`;

export class DependenciesTemplate {
  static parse(model: { dependency_injection: string }): string {
    let __IMPORTS__ = "";
    let __ARGS__ = "";

    if (model.dependency_injection === "inversify") {
      __IMPORTS__ = `import { Container } from 'inversify';`;
      __ARGS__ = "container: Container";
    }

    return DEPENDENCIES_TEMPLATE.replace("__IMPORTS__", __IMPORTS__)
      .replace("__ARGS__", __ARGS__)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}
