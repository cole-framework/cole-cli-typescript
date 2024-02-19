import {
  ComponentData,
  FileTemplateModel,
  WriteMethod,
} from "@cole-framework/cole-cli-core";
import {
  MethodInfo,
  TypeScriptClassInfo,
  TypeScriptFileInfo,
  TypeScriptFileModifier,
  TypeScriptFileReader,
} from "../core";
import { RouterItemTemplate } from "../templates";

export class RoutesDefaultModifier {
  private modifier: TypeScriptFileModifier;
  private routesClass: TypeScriptClassInfo;
  private configureMethod: MethodInfo;
  private content = [];

  constructor(
    private path: string,
    private web_framework: string,
    private dependency_injection: string
  ) {
    const routesFile = TypeScriptFileReader.readFile(path);
    this.modifier = new TypeScriptFileModifier(routesFile);
    this.routesClass = routesFile.classes.find((c) => c.name === "Routes");
    this.configureMethod = this.routesClass.methods.find(
      (c) => c.name === "configure"
    );
  }

  addRoute(route: ComponentData) {
    const { dependency_injection, web_framework } = this;
    this.content.push(
      RouterItemTemplate.parse({
        controller: route.addons["controller"],
        handler: route.addons["handler"],
        dependency_injection,
        web_framework,
      })
    );
  }

  modify() {
    return this.modifier.exportFileOutput(this.path, WriteMethod.Write);
  }
}

export class RoutesTemplateModel extends FileTemplateModel {
  static create(path: string, writeMethod: string): FileTemplateModel {
    const file = new FileTemplateModel(path, writeMethod);
    return file;
  }
}
