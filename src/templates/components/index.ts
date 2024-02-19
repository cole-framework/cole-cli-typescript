import {
  DependenciesTemplate,
  DependencyItemTemplateFactory,
} from "./dependencies.template";
import { LauncherTemplate } from "./launcher.template";
import { RouteCtorSuprTemplate } from "./route/route-ctor-supr.template";
import { RouterItemTemplateFactory, RouterTemplate } from "./router.template";

export * from "./launcher.template";
export * from "./dependencies.template";
export * from "./router.template";

export class ComponentTemplates {
  static names = {
    RouteCtorSuprTemplate: "route_ctor_supr",
    Router: "router",
    RouterItem: "router_item",
    Dependencies: "dependencies",
    DependencyItem: "dependenc_item",
    Launcher: "launcher",
  };

  static get(name: string): Function {
    switch (name) {
      case ComponentTemplates.names.RouteCtorSuprTemplate:
        return RouteCtorSuprTemplate.parse;
      case ComponentTemplates.names.Router:
        return RouterTemplate.parse;
      case ComponentTemplates.names.RouterItem:
        return RouterItemTemplateFactory.parse;
      case ComponentTemplates.names.Dependencies:
        return DependenciesTemplate.parse;
      case ComponentTemplates.names.DependencyItem:
        return DependencyItemTemplateFactory.parse;
      case ComponentTemplates.names.Launcher:
        return LauncherTemplate.parse;
      default:
        throw new Error(`Missing template: ${name}`);
    }
  }
}
