import prettier from "prettier";
import { extname } from "path";
import {
  ClassTemplateModel,
  ExportTemplateModel,
  FileOutput,
  FileTemplateModel,
  FunctionTemplateModel,
  ImportTemplateModel,
  InterfaceTemplateModel,
  MethodTemplateModel,
  PropTemplateModel,
  TypeTemplateModel,
} from "@cole-framework/cole-cli-core";
import {
  BodyTemplate,
  ClassTemplate,
  ExportTemplate,
  FunctionTemplate,
  ImportTemplate,
  InterfaceTemplate,
  MethodTemplate,
  PropTemplate,
  TypeTemplate,
} from "../templates";
import {
  MethodInfo,
  TypeScriptClassInfo,
  TypeScriptFileInfo,
  TypeScriptFileReader,
  TypeScriptInterfaceInfo,
  TypeScriptTypeInfo,
} from "./typescript.file-reader";

export class TypeScriptFileModifier {
  private __updated = false;
  private __file: TypeScriptFileInfo;

  constructor(file: TypeScriptFileInfo) {
    this.__file = TypeScriptFileInfo.clone(file);
  }

  get isUpdated() {
    return this.__updated;
  }

  public updateFileCode(line: number, column: number, code: string) {
    this.__updated = true;
    const lines = this.__file.rawCode.split("\n");
    lines.splice(line > 0 ? line - 1 : 0, 0, code);
    const newCode = lines.join("\n");
    this.__file = TypeScriptFileReader.readCode(newCode);
  }

  public addImport(model: ImportTemplateModel) {
    const newImportCode = ImportTemplate.parse(model);
    const lastImport = this.__file.imports.at(-1);

    if (lastImport) {
      this.updateFileCode(lastImport.endLine, -1, newImportCode);
    } else {
      this.__updated = true;
      this.__file = TypeScriptFileReader.readCode(
        `${newImportCode}\n${this.__file.rawCode}`
      );
    }
  }

  public addExport(model: ExportTemplateModel) {
    const newExportCode = ExportTemplate.parse(model);
    const lastExport = this.__file.imports.at(-1);

    if (lastExport) {
      this.updateFileCode(lastExport.endLine, -1, newExportCode);
    } else {
      this.__updated = true;
      this.__file = TypeScriptFileReader.readCode(
        `${newExportCode}\n${this.__file.rawCode}`
      );
    }
  }

  public addType(model: TypeTemplateModel) {
    const newTypeCode = TypeTemplate.parse(model);
    const lastType = this.__file.types.at(-1);
    const firstClass = this.__file.classes.at(0);
    const lastImport = this.__file.imports.at(-1);
    const firstFunction = this.__file.functions.at(-1);

    if (lastType) {
      this.updateFileCode(lastType.endLine, -1, newTypeCode);
    } else if (lastImport) {
      this.updateFileCode(lastImport.endLine, -1, newTypeCode);
    } else if (firstFunction) {
      this.updateFileCode(lastImport.startLine - 1, -1, newTypeCode);
    } else if (firstClass) {
      this.updateFileCode(firstClass.startLine - 1, -1, newTypeCode);
    } else {
      this.__updated = true;
      this.__file = TypeScriptFileReader.readCode(
        `${this.__file.rawCode}\n${newTypeCode}`
      );
    }
  }

  public addTypeProperty(
    typeInfo: TypeScriptTypeInfo,
    model: PropTemplateModel
  ) {
    const lastProp = typeInfo.props.at(-1);
    let startLine = -1;

    if (lastProp) {
      startLine = lastProp.endLine;
    } else {
      startLine = typeInfo.startLine;
    }

    if (startLine > -1) {
      this.updateFileCode(startLine, -1, PropTemplate.parse(model, "type"));
    }
  }

  public addInterface(model: InterfaceTemplateModel) {
    const newInterfaceCode = InterfaceTemplate.parse(model);
    const lastInterface = this.__file.interfaces.at(-1);
    const firstClass = this.__file.classes.at(0);
    const lastImport = this.__file.imports.at(-1);

    if (lastInterface) {
      this.updateFileCode(lastInterface.endLine, -1, newInterfaceCode);
    } else if (lastImport) {
      this.updateFileCode(lastImport.endLine, -1, newInterfaceCode);
    } else if (firstClass) {
      this.updateFileCode(firstClass.startLine - 1, -1, newInterfaceCode);
    } else {
      this.__updated = true;
      this.__file = TypeScriptFileReader.readCode(
        `${this.__file.rawCode}\n${newInterfaceCode}`
      );
    }
  }

  public addInterfaceMethod(
    interfaceInfo: TypeScriptInterfaceInfo,
    model: MethodTemplateModel
  ) {
    const lastMethod = interfaceInfo.methods.at(-1);
    let startLine = -1;

    if (lastMethod) {
      startLine = lastMethod.endLine;
    } else if (interfaceInfo.props.length > 0) {
      startLine = interfaceInfo.props.at(-1).endLine;
    } else {
      startLine = interfaceInfo.startLine;
    }

    if (startLine > -1) {
      this.updateFileCode(
        startLine,
        -1,
        MethodTemplate.parse(model, "interface")
      );
    }
  }

  public addInterfaceProperty(
    interfaceInfo: TypeScriptInterfaceInfo,
    model: PropTemplateModel
  ) {
    const lastProp = interfaceInfo.props.at(-1);
    const firstMethod = interfaceInfo.methods.at(0);
    let startLine = -1;

    if (lastProp) {
      startLine = lastProp.endLine;
    } else if (firstMethod) {
      startLine = firstMethod.startLine - 1;
    } else {
      startLine = interfaceInfo.startLine;
    }

    if (startLine > -1) {
      this.updateFileCode(
        startLine,
        -1,
        PropTemplate.parse(model, "interface")
      );
    }
  }

  public addClass(model: ClassTemplateModel) {
    this.__updated = true;
    const newClassCode = ClassTemplate.parse(model);
    this.__file = TypeScriptFileReader.readCode(
      `${this.__file.rawCode}\n${newClassCode}`
    );
  }

  public addFunction(model: FunctionTemplateModel) {
    this.__updated = true;
    const newFunctionCode = FunctionTemplate.parse(model);

    const lastFunction = this.__file.functions.at(-1);
    const firstClass = this.__file.classes.at(0);
    const lastImport = this.__file.imports.at(-1);

    if (lastFunction) {
      this.updateFileCode(lastFunction.endLine, -1, newFunctionCode);
    } else if (lastImport) {
      this.updateFileCode(lastImport.endLine, -1, newFunctionCode);
    } else if (firstClass) {
      this.updateFileCode(firstClass.startLine - 1, -1, newFunctionCode);
    } else {
      this.__updated = true;
      this.__file = TypeScriptFileReader.readCode(
        `${this.__file.rawCode}\n${newFunctionCode}`
      );
    }
  }

  public updateClassMethod(
    classInfo: TypeScriptClassInfo,
    method: MethodInfo,
    model: MethodTemplateModel
  ) {
    // TODO: update params

    if (method.body.endLine > -1) {
      this.updateFileCode(
        method.body.endLine,
        -1,
        BodyTemplate.parse(model.body)
      );
    }
  }

  public addClassMethod(
    classInfo: TypeScriptClassInfo,
    model: MethodTemplateModel
  ) {
    const lastEqAccessMethod = classInfo.methods
      .filter((m) => {
        return (
          m.accessibility === `${model.access}` ||
          (!m.accessibility && model.access === "public")
        );
      })
      .pop();
    let startLine = -1;

    if (lastEqAccessMethod) {
      startLine = lastEqAccessMethod.endLine;
    } else if (classInfo.ctor) {
      startLine = classInfo.ctor.endLine;
    } else if (classInfo.props.length > 0) {
      startLine = classInfo.props.at(-1).endLine;
    } else {
      startLine = classInfo.startLine;
    }

    if (startLine > -1) {
      this.updateFileCode(
        startLine,
        -1,
        MethodTemplate.parse(
          model,
          classInfo.abstract ? "abstract_class" : "class"
        )
      );
    }
  }

  public addClassProperty(
    classInfo: TypeScriptClassInfo,
    model: PropTemplateModel
  ) {
    const lastEqAccessProp = classInfo.props
      .filter((p) => p.accessibility === `${model.access}`)
      .pop();
    let startLine = -1;

    if (lastEqAccessProp) {
      startLine = lastEqAccessProp.endLine;
    } else if (classInfo.ctor) {
      startLine = classInfo.ctor.startLine - 1;
    } else {
      startLine = classInfo.startLine;
    }

    if (startLine > -1) {
      this.updateFileCode(startLine, -1, PropTemplate.parse(model));
    }
  }

  async modify(model: FileTemplateModel): Promise<FileOutput> {
    model.content.imports.forEach((virtual) => {
      const ep = virtual.path.replace(extname(virtual.path), "");
      if (
        this.__file.imports.findIndex((c) => {
          return c.path === ep;
        }) === -1
      ) {
        this.addImport(virtual);
      }
    });

    model.content.exports.forEach((virtual) => {
      const ep = virtual.path.replace(extname(virtual.path), "");
      if (this.__file.exports.findIndex((c) => c.path === ep) === -1) {
        this.addExport(virtual);
      }
    });

    model.content.types.forEach((virtual) => {
      const type = this.__file.types.find((c) => c.name === virtual.name);
      if (type) {
        virtual.props.forEach((item) => {
          if (
            type.props.findIndex((m) => {
              return m.name === item.name;
            }) === -1
          ) {
            this.addTypeProperty(type, item);
          }
        });
      } else {
        this.addType(virtual);
      }
    });

    model.content.interfaces.forEach((virtual) => {
      const intf = this.__file.interfaces.find((c) => c.name === virtual.name);
      if (intf) {
        virtual.methods.forEach((item) => {
          if (intf.methods.findIndex((m) => m.name === item.name) === -1) {
            this.addInterfaceMethod(intf, item);
          }
        });
        virtual.props.forEach((item) => {
          if (intf.props.findIndex((m) => m.name === item.name) === -1) {
            this.addInterfaceProperty(intf, item);
          }
        });
      } else {
        this.addInterface(virtual);
      }
    });

    model.content.functions.forEach((virtual) => {
      if (
        this.__file.functions.findIndex((f) => f.name === virtual.name) === -1
      ) {
        this.addFunction(virtual);
      }
    });

    model.content.classes.forEach((virtual) => {
      const clss = this.__file.classes.find((c) => c.name === virtual.name);
      if (clss) {
        virtual.methods.forEach((item) => {
          const vm = clss.methods.find((m) => m.name === item.name);
          if (vm) {
            this.updateClassMethod(clss, vm, item);
          } else {
            this.addClassMethod(clss, item);
          }
        });
        virtual.props.forEach((item) => {
          if (
            clss.props.findIndex((m) => {
              return m.name === item.name;
            }) === -1
          ) {
            this.addClassProperty(clss, item);
          }
        });
      } else {
        this.addClass(virtual);
      }
    });

    return this.__updated
      ? this.exportFileOutput(model.path, model.write_method)
      : null;
  }

  async exportFileOutput(path: string, write_method: string) {
    const formattedCode = await prettier.format(this.__file.rawCode, {
      parser: "typescript",
    });
    return new FileOutput(path, write_method, formattedCode);
  }
}
