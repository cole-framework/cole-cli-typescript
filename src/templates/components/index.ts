import { RouteCtorSuprTemplate } from "./route/route-ctor-supr.template";

export class ComponentTemplates {
  static get(name: string): Function {
    switch (name) {
      case "route_ctor_supr":
        return RouteCtorSuprTemplate.parse;
      default:
        throw new Error(`Missing template: ${name}`);
    }
  }
}
