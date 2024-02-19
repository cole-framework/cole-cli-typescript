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

export const INVERSIFY_CONTAINER_GETTER = `container.get<__CONTROLLER_CLASS__>(__CONTROLLER_CLASS__.Token)`;
export const SINGLETON_CONTAINER_GETTER = `Singleton.get<__CONTROLLER_CLASS__>(__CONTROLLER_CLASS__.Token)`;
export const CONTROLLER_NEW_INSTANCE = `new __CONTROLLER_CLASS__()`;

export const ROUTER_ITEM_TEMPLATE = `
    const __CONTROLLER_NAME__ = __CONTAINER_GETTER__;
    this.mount(
     __ROUTE_CLASS__.create(__CONTROLLER_NAME__.__HANDLER_NAME__.bind(__CONTROLLER_NAME__))
    );`;

export class RouterItemTemplate {
  static parse(model: {
    name: string;
    controller: string;
    handler: string;
    dependency_injection: string;
    web_framework: string;
  }): string {
    const __CONTROLLER_NAME__ = camelCase(model.controller);
    const __CONTROLLER_CLASS__ = pascalCase(model.controller);
    const __ROUTE_CLASS__ = pascalCase(model.name);
    const __HANDLER_NAME__ = model.handler;
    let __CONTAINER_GETTER__;

    if (model.dependency_injection === "inversify") {
      __CONTAINER_GETTER__ = INVERSIFY_CONTAINER_GETTER;
    } else if (model.dependency_injection === "singleton") {
      __CONTAINER_GETTER__ = SINGLETON_CONTAINER_GETTER;
    } else {
      __CONTAINER_GETTER__ = CONTROLLER_NEW_INSTANCE;
    }

    return ROUTER_ITEM_TEMPLATE.replace(
      /__CONTAINER_GETTER__/g,
      __CONTAINER_GETTER__
    )
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
    }[];
    options: { dependency_injection: string; web_framework: string };
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
