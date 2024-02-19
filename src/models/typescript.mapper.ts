import { FileTemplateModel } from "@cole-framework/cole-cli-core";
import { TypeScriptFileInfo } from "../core";

export class TypeScriptMapper {
  toFileTemplateModel(
    path: string,
    writeMethod: string,
    info: TypeScriptFileInfo
  ): FileTemplateModel {
    const content = {
      classes: [],
      types: [],
      interfaces: [],
      functions: [],
      imports: [],
      exports: [],
    };

    info.classes.forEach(cls => {
      
    })

    /*
    public readonly classes: TypeScriptClassInfo[] = [];
  public readonly types: TypeScriptTypeInfo[] = [];
  public readonly interfaces: TypeScriptInterfaceInfo[] = [];
  public readonly functions: TypeScriptFunctionInfo[] = [];
  public readonly imports: TypeScriptImportInfo[] = [];
  public readonly exports: TypeScriptExportInfo[] = [];
    */

    const file = new FileTemplateModel(path, writeMethod, content);
    return file;
  }
}
