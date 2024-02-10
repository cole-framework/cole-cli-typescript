import {
  Strategy,
  FileTemplateModel,
  ComponentData,
  ExportTemplateModel,
  ApiObject,
  Result,
  WriteMethod,
  ExportSchemaObject,
} from "@cole-framework/cole-cli-core";
import { basename, dirname, extname, join, relative } from "path";

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

  public apply(api: ApiObject): Result<FileTemplateModel[]> {
    try {
      const templateModels = new Map<string, FileTemplateModel>();

      api.controllers.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
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
      api.route_ios.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
      api.routes.forEach((item) =>
        this.updateTemplateModel(templateModels, item)
      );
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

      const models = Array.from(templateModels, ([, value]) => value);

      // create index.ts files
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

      const indexes = Array.from(
        indexModelsByPath,
        ([path, exports]) =>
          new FileTemplateModel(path, WriteMethod.Write, { exports })
      );

      return Result.withContent([...indexes, ...models]);
    } catch (error) {
      return Result.withFailure(error);
    }
  }
}
