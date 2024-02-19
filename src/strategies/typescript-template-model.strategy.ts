import {
  Strategy,
  FileTemplateModel,
  ComponentData,
  ExportTemplateModel,
  ApiObject,
  Result,
  WriteMethod,
  ExportSchemaObject,
  ProjectDescription,
  BodyTemplateModel,
} from "@cole-framework/cole-cli-core";
import { basename, dirname, extname, join, relative } from "path";
import { ComponentTemplates } from "../templates";

export class TypeScriptTemplateModelStrategy extends Strategy {
  private updateTemplateModel(
    files: Map<string, FileTemplateModel>,
    data: ComponentData
  ) {
    let file = files.get(data.path);

    if (!file) {
      file = new FileTemplateModel(data.path, data.write_method);
      files.set(data.path, file);
    }
    file.update(data);
  }

  private createDependneciesTemplateModel(
    data: ComponentData,
    project: ProjectDescription
  ): FileTemplateModel {
    const configurator = data.element.methods.find(
      (m) => Array.isArray(m.meta) && m.meta.includes("isConfigurator")
    );

    const file = new FileTemplateModel(data.path, data.write_method);
    file.update(data);

    const configuratorClass = file.content.classes.find(
      (cls) => cls.name === data.type.name
    );
    if (configuratorClass) {
      const configureMethod = configuratorClass.methods.find(
        (m) => m.name === configurator.name
      );

      if (configureMethod) {
        configureMethod.body = BodyTemplateModel.create({
          content: data.dependencies.map((d) => d.type),
          template: ComponentTemplates.names.DependencyItem,
          options: { ...project },
        });
      }
    }

    return file;
  }

  private createRouterTemplateModel(
    data: ComponentData,
    project: ProjectDescription
  ): FileTemplateModel {
    const configurator = data.element.methods.find(
      (m) => Array.isArray(m.meta) && m.meta.includes("isConfigurator")
    );

    const file = new FileTemplateModel(data.path, data.write_method);
    file.update(data);

    const configuratorClass = file.content.classes.find(
      (cls) => cls.name === data.type.name
    );
    if (configuratorClass) {
      const configureMethod = configuratorClass.methods.find(
        (m) => m.name === configurator.name
      );

      if (configureMethod) {
        configureMethod.body = BodyTemplateModel.create({
          content: data.addons["routes"],
          template: ComponentTemplates.names.RouterItem,
          options: { ...project },
        });
      }
    }

    return file;
  }

  private addExport(
    exports: ExportSchemaObject[],
    path: string,
    exp: ExportSchemaObject
  ) {
    if (exp) {
      const cExp = exports.find((e) => e.path === path);
      if (!cExp) {
        exports.push(
          ExportTemplateModel.create({
            ...exp,
            path,
          })
        );
      }
    }
  }

  private updateIndexFiles(models: FileTemplateModel[]): FileTemplateModel[] {
    const indexModelsByPath = new Map<string, ExportTemplateModel[]>();
    models.forEach((model) => {
      if (model.write_method === WriteMethod.Skip) {
        return;
      }

      const dir = dirname(model.path);
      const indexPath = join(dir, "index.ts");
      let temp = join(
        relative(dirname(indexPath), dirname(model.path)),
        basename(model.path).replace(extname(model.path), "")
      );

      const path = temp.startsWith(".") ? temp : `./${temp}`;

      let exports = indexModelsByPath.get(indexPath);

      if (!exports) {
        exports = [];
        indexModelsByPath.set(indexPath, exports);
      }

      model.content.classes.forEach((item) => {
        this.addExport(exports, path, item.exp);
      });

      model.content.types.forEach((item) => {
        this.addExport(exports, path, item.exp);
      });

      model.content.functions.forEach((item) => {
        this.addExport(exports, path, item.exp);
      });
    });

    return Array.from(
      indexModelsByPath,
      ([path, exports]) =>
        new FileTemplateModel(path, WriteMethod.Write, { exports })
    );
  }

  public apply(
    api: ApiObject,
    project: ProjectDescription
  ): Result<FileTemplateModel[]> {
    try {
      const templateModels = new Map<string, FileTemplateModel>();

      api.controllers.forEach((item) => {
        this.updateTemplateModel(templateModels, item);
      });
      api.entities.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.mappers.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.models.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.repositories.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.repository_factories.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.repository_impls.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.route_ios.forEach((item) => {
        this.updateTemplateModel(templateModels, item);
      });
      api.routes.forEach((item) => {
        this.updateTemplateModel(templateModels, item);
      });
      api.sources.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.toolsets.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.use_cases.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.test_suites.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );

      if (api.container?.dependencies?.length > 0) {
        const model = this.createDependneciesTemplateModel(
          api.container,
          project
        );
        templateModels.set(model.path, model);
      }

      if (api.router?.dependencies?.length > 0) {
        const model = this.createRouterTemplateModel(api.router, project);
        templateModels.set(model.path, model);
      }

      const models = Array.from(templateModels, ([, value]) => value);
      const indexes = this.updateIndexFiles(models);

      return Result.withContent([...indexes, ...models]);
    } catch (error) {
      return Result.withFailure(error);
    }
  }
}
