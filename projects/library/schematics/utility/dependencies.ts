import { Rule, Tree } from '@angular-devkit/schematics';
import { addPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';

export function addDependencies(project: string): Rule {
  return (host: Tree): Tree => {
    addPackageJsonDependency(host, {
      type: 'scripts' as any, // scripts is not a valid NodeDependencyType
      name: 'start',
      version: 'run-p "start:* -- --prod --single-bundle true"',
      overwrite: true,
    });

    addPackageJsonDependency(host, {
      type: 'scripts' as any, // scripts is not a valid NodeDependencyType
      name: 'prestart',
      version: 'ngcc',
      overwrite: false,
    });

    addPackageJsonDependency(host, {
      type: 'scripts' as any, // scripts is not a valid NodeDependencyType
      name: 'build:element',
      version: 'npm run build -- --prod --single-bundle true',
      overwrite: false,
    });

    addPackageJsonDependency(host, {
      type: 'scripts' as any, // scripts is not a valid NodeDependencyType
      name: 'build:elements',
      version: 'run-p build:element:**',
      overwrite: false,
    });

    addPackageJsonDependency(host, {
      type: NodeDependencyType.Dev,
      name: 'npm-run-all',
      version: '^4.1.5',
      overwrite: false,
    });

    addPackageJsonDependency(host, {
      type: NodeDependencyType.Dev,
      name: 'npm-run-all',
      version: '^4.1.5',
      overwrite: false,
    });

    addProjectScripts(host, project);

    return host;
  };
}

export function addMicroDependencies(project: string): Rule {
  return (host: Tree): Tree => {
    addPackageJsonDependency(host, {
      type: 'scripts' as any, // scripts is not a valid NodeDependencyType
      name: `build:element:${project}`,
      version: `npm run build:element --project ${project}`,
      overwrite: false,
    });

    addPackageJsonDependency(host, {
      type: NodeDependencyType.Dev,
      name: 'webpack-manifest-plugin',
      version: '^3.0.0',
      overwrite: false,
    });

    return host;
  };
}

function addProjectScripts(host: Tree, project: string): void {
  addPackageJsonDependency(host, {
    type: 'scripts' as any, // scripts is not a valid NodeDependencyType
    name: `start:${project}`,
    version: `ng serve --project ${project}`,
    overwrite: false,
  });

  addPackageJsonDependency(host, {
    type: 'scripts' as any, // scripts is not a valid NodeDependencyType
    name: `start:${project}`,
    version: `ng serve --project ${project}`,
    overwrite: false,
  });
}
