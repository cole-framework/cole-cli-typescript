import { TestSuiteTemplateModel } from "@cole-framework/cole-cli-core";
import { ComponentTemplates } from "../components";
import { TestCaseTemplate } from "./test-case.template";

export const TEST_SUITE_TEMPLATE = `
describe('_TITLE_', () => {
  _TESTS_
});`;

export class TestSuiteTemplate {
  static parse(model: TestSuiteTemplateModel): string {
    if (model.template) {
      return ComponentTemplates.get(model.template)(model);
    }

    const tests = [];
    const _TITLE_ = model.name;
    model.tests.forEach((t) => {
      tests.push(TestCaseTemplate.parse(t));
    });

    const _TESTS_ = tests.join(`
    `);

    return TEST_SUITE_TEMPLATE.replace("_TITLE_", _TITLE_)
      .replace("_TESTS_", _TESTS_)
      .replace(/[ ]+/g, " ")
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}
