import { join, normalize } from '@angular-devkit/core';
import { Rule, Tree } from '@angular-devkit/schematics';
import { addRouteDeclarationToModule, getSourceNodes, insertImport } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { ROUTING_MODULE_EXT } from '@schematics/angular/utility/find-module';
import { Application } from './applications';

import { addImplements, getSource, updateConstructor, updateLifecycleHook } from './ast';
import { handleChanges } from './changes';

export function addRouteToMicroFrontend(sourceRoot: string): Rule {
  return (host: Tree): Tree => {
    const modulePath = join(normalize(sourceRoot), normalize(`app/app${ROUTING_MODULE_EXT}`));
    const source = getSource(host, modulePath);
    const changes = [
      insertImport(source, modulePath, 'NullComponent', 'ng-micro-frontend'),
      addRouteDeclarationToModule(source, modulePath, `{ component: NullComponent, path: '**' }`) as InsertChange,
    ];

    return handleChanges(host, modulePath, changes);
  };
}

export function addInitialNavigation(sourceRoot: string): Rule {
  return (host: Tree): Tree => {
    const componentPath = join(normalize(sourceRoot), normalize('app/app.component.ts'));
    const source = getSource(host, componentPath);
    const nodes = getSourceNodes(source);

    const ngOnInit = `
    if (environment.production) {
      this.router.initialNavigation();
      this.router.navigate([this.location.path()]);
    }
`;

    const changes = [
      insertImport(source, componentPath, 'Location', '@angular/common'),
      insertImport(source, componentPath, 'OnInit', '@angular/core'),
      insertImport(source, componentPath, 'Router', '@angular/router'),
      insertImport(source, componentPath, 'environment', '../environments/environment'),
      addImplements(nodes, componentPath, 'OnInit'),
      updateConstructor(nodes, componentPath, ['Location', 'Router']),
      updateLifecycleHook(nodes, componentPath, 'ngOnInit', ngOnInit),
    ];

    return handleChanges(host, componentPath, changes);
  };
}

export function addRoutesToShell(applications: Application[], sourceRoot: string): Rule {
  return (host: Tree): Tree => {
    const modulePath = join(normalize(sourceRoot), normalize(`app/app${ROUTING_MODULE_EXT}`));
    const source = getSource(host, modulePath);
    const last = applications[applications.length - 1];
    const getEnd = (a: Application) => a === last ? '\n' : '';

    const changes = applications.map((a) => addRouteDeclarationToModule(
      source,
      modulePath,
      `\n  RouteFactory.createRoute('${a.dasherized}', 'http://localhost:${a.port}'),${getEnd(a)}`,
    ));

    changes.push(insertImport(source, modulePath, 'RouteFactory', 'ng-micro-frontend'));

    return handleChanges(host, modulePath, changes);
  };
}
