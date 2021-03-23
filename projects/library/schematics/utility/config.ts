import { join, normalize, workspaces } from '@angular-devkit/core';
import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';

import { getCustomElementName } from './micro-frontend';

export function addMicroWebpackConfig(root: string, project: string): Rule {
  return (host: Tree): Tree => {
    const webpackPath = join(normalize(root), 'webpack.config.js');
    const webpackProdPath = join(normalize(root), 'webpack.prod.config.js');
    const webpackData = `const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = {
  plugins: [
    new WebpackManifestPlugin({
      filter: (file) => file.name.endsWith('.js') || file.name.endsWith('.css'),
      seed: { customElement: '${getCustomElementName(project)}' },
    }),
  ],
};
`;
    const webpackProdData = `module.exports = require('./webpack.config.js');\n`;

    host.create(webpackPath, webpackData);
    host.create(webpackProdPath, webpackProdData);

    return host;
  };
}

export function updateMicroAngularConfig(config: workspaces.ProjectDefinition): Rule {
  return (host: Tree): Tree => {
    const build = config.targets.get('build');
    const serve = config.targets.get('serve');
    const test = config.targets.get('test');
    const webpackPath = join(normalize(config.root), 'webpack.config.js');
    const webpackProdPath = join(normalize(config.root), 'webpack.prod.config.js');

    if (!build) {
      throw new SchematicsException('Invalid application configuration: "build" not found!');
    }

    if (!build.options) {
      build.options = { };
    }

    if (!build.configurations) {
      build.configurations = { };
    }

    if (!build.configurations.production) {
      build.configurations.production = { };
    }

    if (!serve) {
      throw new SchematicsException('Invalid application configuration: "serve" not found!');
    }

    if (!serve.options) {
      serve.options = { };
    }

    if (!serve.configurations) {
      serve.configurations = { };
    }

    if (!serve.configurations.production) {
      serve.configurations.production = { };
    }

    if (!test) {
      throw new SchematicsException('Invalid application configuration: "test" not found!');
    }

    if (!test.options) {
      test.options = { };
    }

    build.options.extraWebpackConfig = webpackPath;
    build.configurations.production.extraWebpackConfig = webpackProdPath;
    serve.options.extraWebpackConfig = webpackPath;
    serve.configurations.production.extraWebpackConfig = webpackProdPath;
    test.options.extraWebpackConfig = webpackPath;

    return host;
  };
}

export function updateAngularConfig(config: workspaces.ProjectDefinition, port: number): Rule {
  return (host: Tree): Tree => {
    const serve = config.targets.get('serve');

    if (isNaN(port)) {
      throw new SchematicsException('Port must be a number!');
    }

    if (!serve) {
      throw new SchematicsException('Invalid application configuration: "serve" not found!');
    }

    if (!serve.options) {
      serve.options = { };
    }

    serve.options.port = port;

    return host;
  };
}
