import { join, normalize, strings } from '@angular-devkit/core';
import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import { addImportToModule, addSymbolToNgModuleMetadata, getDecoratorMetadata, getMetadataField, getSourceNodes, insertImport } from '@schematics/angular/utility/ast-utils';
import { Change, InsertChange, NoopChange } from '@schematics/angular/utility/change';
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
    const customElement = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('${getCustomElementName(project)}', customElement);
`;

    const changes = [
      insertImport(source, modulePath, 'DoBootstrap', '@angular/core'),
      insertImport(source, modulePath, 'Injector', '@angular/core'),
      insertImport(source, modulePath, 'createCustomElement', '@angular/elements'),
      insertImport(source, modulePath, 'environment', '../environments/environment'),
      getBootstrapChange(source, modulePath),
      addImplements(nodes, modulePath, 'DoBootstrap'),
      updateConstructor(nodes, modulePath, ['Injector']),
      updateLifecycleHook(nodes, modulePath, 'ngDoBootstrap', ngDoBootstrap)
    ];

    return handleChanges(host, modulePath, changes);
  };
}

function getBootstrapChange(source: ts.SourceFile, modulePath: string): Change {
  const nodes = getDecoratorMetadata(source, 'NgModule', '@angular/core');
  let node: any = nodes[0];

  if (!node) {
    throw new SchematicsException(`Could not find NgModule nodes in ${modulePath}!`);
  }

  const matchingProperties = getMetadataField(node as ts.ObjectLiteralExpression, 'bootstrap');

  if (!matchingProperties) {
    throw new SchematicsException(`Could not bootstrap property in ${modulePath}!`);
  }

  const assignment = matchingProperties[0] as ts.PropertyAssignment;

  if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
    throw new SchematicsException(`Bootstrap property is not an array in ${modulePath}!`);
  }

  const arrLiteral = assignment.initializer as ts.ArrayLiteralExpression;

  node = arrLiteral.elements.length === 0 ? arrLiteral : arrLiteral.elements;

  if (!node) {
    throw new SchematicsException(`Bootstrap property is not a valid node in in ${modulePath}!`);
  }

  const newBootstrap = 'environment.production ? [] : ';

  if (Array.isArray(node)) {
    const nodeArray = node as {} as Array<ts.Node>;
    const symbolsArray = nodeArray.map((n) => n.getText());

    if (symbolsArray.includes(newBootstrap)) {
      return new NoopChange();
    }

    node = node[node.length - 1];
  }

  return new InsertChange(modulePath, node.getStart() - 1, newBootstrap);
}
