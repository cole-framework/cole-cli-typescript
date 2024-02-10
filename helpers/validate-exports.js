const fs = require('fs');
const chalk = require('chalk');
const filePath = `${process.cwd()}/build/index.d.ts`;

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Read error:', err);
    return;
  }

  let failed = false;

  ['createTemplateModelStrategy',
    'createFileOutputStrategy',
    'createProjectBuildStrategy',
    'createProjectInitStrategy',
    'Config',
  ].forEach(exportName => {
    if (
      data.includes(`export declare const ${exportName}`) === false
    ) {
      failed = true;
      console.log(chalk.gray(`Missing export:`), chalk.bgRed(exportName));
    }
  });

  if (failed) {
    process.exit(1);
  }
});
