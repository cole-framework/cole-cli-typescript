export const EXPRESS_LAUNCHER_TEMPLATE = `
__IMPORTS__
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { Routes } from './routes';
import { Dependencies } from './dependencies';

const start = async () => {
  const app = express();
  app.use(
    cors({
      origin: '*',
    })
  );
  app.use(bodyParser.json());
  __DEPENDENCIES__
  const routes = new Routes(app);
  routes.configure(__ROUTES_CONFIGURE_ARGS__);

  app.listen(port, () => {
    console.log(\`Server is running at http://localhost:\${port}\`);
  });
};

start();
`;

export const UNKNOWN_WEB_FRAMEWORK_LAUNCHER_TEMPLATE = `
__IMPORTS__
import { Routes } from './routes';
import { Dependencies } from './dependencies';

const start = async () => {
  /* PLEASE INITIALIZE WEB FRAMEWORK OF YOUR CHOISE */
  const framework_placeholder = {
    get:(...args: any[]) => {},
    post:(...args: any[]) => {},
    put:(...args: any[]) => {},
    patch:(...args: any[]) => {},
    delete:(...args: any[]) => {},
    listen:(...args: any[]) => {},
    use:(...args: any[]) => {}
  }
  __DEPENDENCIES__
  const routes = new Routes(framework_placeholder);
  routes.configure(__ROUTES_CONFIGURE_ARGS__);

  /* RUN SERVER */
  framework_placeholder.listen(port, () => {
    console.log(\`Server is running at http://localhost:\${port}\`);
  });
};

start();
`;

export const INVERSIFY_DEPENDENCIES_SETUP_TEMPLATE = `
  const container = new Container();
  const dependencies = new Dependencies();
  dependencies.configure(container);
`;

export const SINGLETON_DEPENDENCIES_SETUP_TEMPLATE = `
  const dependencies = new Dependencies();
  dependencies.configure();
`;

export class LauncherTemplate {
  static parse(model: {
    web_framework: string;
    dependency_injection: string;
  }): string {
    let template;
    let __IMPORTS__ = "";
    let __DEPENDENCIES__ = "";
    let __ROUTES_CONFIGURE_ARGS__ = "";

    if (model.dependency_injection === "inversify") {
      __IMPORTS__ = `import { Container } from 'inversify';`;
      __DEPENDENCIES__ = INVERSIFY_DEPENDENCIES_SETUP_TEMPLATE;
      __ROUTES_CONFIGURE_ARGS__ = "container";
    } else {
      __DEPENDENCIES__ = SINGLETON_DEPENDENCIES_SETUP_TEMPLATE;
    }

    if (model.web_framework === "express") {
      template = EXPRESS_LAUNCHER_TEMPLATE;
    } else {
      template = UNKNOWN_WEB_FRAMEWORK_LAUNCHER_TEMPLATE;
    }

    return template
      .replace("__IMPORTS__", __IMPORTS__)
      .replace("__DEPENDENCIES__", __DEPENDENCIES__)
      .replace("__ROUTES_CONFIGURE_ARGS__", __ROUTES_CONFIGURE_ARGS__)
      .replace(/^(\s*\n\s*)+$/gm, "\n");
  }
}
