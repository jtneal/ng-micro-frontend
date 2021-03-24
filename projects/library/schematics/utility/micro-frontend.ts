import { join, normalize, strings } from '@angular-devkit/core';
import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { addImportToModule, addSymbolToNgModuleMetadata, getDecoratorMetadata, getMetadataField, getSourceNodes, insertImport } from '@schematics/angular/utility/ast-utils';
import { Change, NoopChange, RemoveChange, } from '@schematics/angular/utility/change';
import { MODULE_EXT } from '@schematics/angular/utility/find-module';
import * as ts from 'typescript';

import { addImplements, getSource, updateConstructor, updateLifecycleHook } from './ast';
import { handleChanges } from './changes';

export function getCustomElementName(project: string): string {
  const name = strings.dasherize(project);

  return name.includes('-') ? name : `custom-${name}`;
}

export function setupShell(sourceRoot: string): Rule {
  return (host: Tree) => {
    const modulePath = join(normalize(sourceRoot), normalize(`app/app${MODULE_EXT}`));
    const source = getSource(host, modulePath);

    const changes = [
      ...addImportToModule(source, modulePath, 'MicroFrontendModule', 'ng-micro-frontend'),
      ...addSymbolToNgModuleMetadata(source, modulePath, 'schemas', 'CUSTOM_ELEMENTS_SCHEMA', '@angular/core'),
    ];

    return handleChanges(host, modulePath, changes);
  };
}

export function setupCustomElement(sourceRoot: string, project: string): Rule {
  return (host: Tree) => {
    const modulePath = join(normalize(sourceRoot), normalize(`app/app${MODULE_EXT}`));
    const source = getSource(host, modulePath);
    const nodes = getSourceNodes(source);

    const ngDoBootstrap = `
    if (environment.production) {
      const customElement = createCustomElement(AppComponent, { injector: this.injector });
      customElements.define('${getCustomElementName(project)}', customElement);
    } else {
      appRef.bootstrap(AppComponent);
    }
`;

    const changes = [
      insertImport(source, modulePath, 'ApplicationRef', '@angular/core'),
      insertImport(source, modulePath, 'DoBootstrap', '@angular/core'),
      insertImport(source, modulePath, 'Injector', '@angular/core'),
      insertImport(source, modulePath, 'createCustomElement', '@angular/elements'),
      insertImport(source, modulePath, 'environment', '../environments/environment'),
      getBootstrapChange(source, modulePath),
      addImplements(nodes, modulePath, 'DoBootstrap'),
      updateConstructor(nodes, modulePath, ['Injector']),
      updateLifecycleHook(nodes, modulePath, 'ngDoBootstrap', ngDoBootstrap, 'appRef: ApplicationRef')
    ];

    return handleChanges(host, modulePath, changes);
  };
}

function getBootstrapChange(source: ts.SourceFile, modulePath: string): Change {
  const nodes = getDecoratorMetadata(source, 'NgModule', '@angular/core');
  const node: any = nodes[0];

  if (!node) {
    throw new SchematicsException(`Could not find NgModule nodes in ${modulePath}!`);
  }

  const matchingProperties = getMetadataField(node as ts.ObjectLiteralExpression, 'bootstrap');

  if (!matchingProperties) {
    return new NoopChange();
  }

  return new RemoveChange(modulePath, matchingProperties[0].getStart() - 2, `  ${matchingProperties[0].getText()}\n`);
}
