import { camelCase, pascalCase } from "change-case";

export const ROUTER_TEMPLATE = `
__IMPORTS__

export class Routes extends Router {
  public configure(__ARGS__) {
    const { framework } = this;
  }
}
`;

export class RouterTemplate {
  static parse(model: { dependency_injection: string }): string {
    let __IMPORTS__ = "";
    let __ARGS__ = "";

    if (model.dependency_injection === "inversify") {
      __IMPORTS__ = `import { Container } from 'inversify';`;
      __ARGS__ = "container: Container";
    } else if (model.dependency_injection === "singleton") {
      __IMPORTS__ = `import { Singleton } from '@soapjs/soap';`;
    }

    return ROUTER_TEMPLATE.replace("__IMPORTS__", __IMPORTS__)
      .replace("__ARGS__", __ARGS__)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}

export const INVERSIFY_CONTAINER_GETTER = `  const __CONTROLLER_NAME__ = container.get<__CONTROLLER_CLASS__>(__CONTROLLER_CLASS__.Token);`;
export const SINGLETON_CONTAINER_GETTER = `  const __CONTROLLER_NAME__ = Singleton.get<__CONTROLLER_CLASS__>(__CONTROLLER_CLASS__.Token);`;
export const CONTROLLER_NEW_INSTANCE = `const __CONTROLLER_NAME__ = new __CONTROLLER_CLASS__();`;

export const ROUTER_ITEM_TEMPLATE = `  this.mount(__ROUTE_CLASS__.create(__CONTROLLER_NAME__.__HANDLER_NAME__.bind(__CONTROLLER_NAME__)));`;

export class RouterItemTemplate {
  static parse(model: {
    name: string;
    controller: string;
    handler: string;
    options: {
      skipConrollerResolver?: boolean;
    };
    dependency_injection: string;
    web_framework: string;
  }): string {
    const { skipConrollerResolver } = model.options;
    const __CONTROLLER_NAME__ = camelCase(model.controller);
    const __CONTROLLER_CLASS__ = pascalCase(model.controller);
    const __ROUTE_CLASS__ = pascalCase(model.name);
    const __HANDLER_NAME__ = model.handler;
    let template = ROUTER_ITEM_TEMPLATE;

    if (!skipConrollerResolver) {
      if (model.dependency_injection === "inversify") {
        template = `${INVERSIFY_CONTAINER_GETTER}\n${ROUTER_ITEM_TEMPLATE}`;
      } else if (model.dependency_injection === "singleton") {
        template = `${SINGLETON_CONTAINER_GETTER}\n${ROUTER_ITEM_TEMPLATE}`;
      } else {
        template = `${CONTROLLER_NEW_INSTANCE}\n${ROUTER_ITEM_TEMPLATE}`;
      }
    }
    return template
      .replace(/__ROUTE_CLASS__/g, __ROUTE_CLASS__)
      .replace(/__CONTROLLER_NAME__/g, __CONTROLLER_NAME__)
      .replace(/__CONTROLLER_CLASS__/g, __CONTROLLER_CLASS__)
      .replace(/__HANDLER_NAME__/g, __HANDLER_NAME__)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}

export class RouterItemTemplateFactory {
  static parse(model: {
    content: {
      name: string;
      path: string;
      controller: string;
      handler: string;
      options: { skipConrollerResolver: boolean };
    }[];
    options: {
      dependency_injection: string;
      web_framework: string;
    };
  }) {
    const { dependency_injection, web_framework } = model.options;
    return model.content
      .map((component) =>
        RouterItemTemplate.parse({
          ...component,
          dependency_injection,
          web_framework,
        })
      )
      .join("\n");
  }
}
